import os
import subprocess
import threading
from concurrent.futures import ThreadPoolExecutor
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.spinner import Spinner
from kivy.uix.progressbar import ProgressBar
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.uix.widget import Widget # === MÓDOSÍTÁS: Szükségünk van a sima Widget-re a távtartóhoz
from plyer import storagepath
import yt_dlp

# --- Ellenőrzés, hogy a yt-dlp és ffmpeg telepítve van-e ---
def check_dependencies():
    """Ellenőrzi a yt-dlp és ffmpeg meglétét a rendszerben."""
    try:
        subprocess.run(['yt-dlp', '--version'], capture_output=True, text=True, check=True, encoding='utf-8')
        subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, check=True, encoding='utf-8')
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("HIBA: A yt-dlp vagy az ffmpeg nincs telepítve, vagy nincs hozzáadva a PATH-hoz.")
        print("Telepítés: pip install yt-dlp")
        print("Az ffmpeg-et innen töltheted le: https://ffmpeg.org/download.html")
        raise Exception("Kritikus függőségek hiányoznak (yt-dlp, ffmpeg)!")

try:
    check_dependencies()
except Exception as e:
    print(e)
    exit() # Kilépés, ha a függőségek hiányoznak




class DownloaderApp(App):
    def build(self):
        # --- Alapbeállítások és Dizájn ---
        self.title = 'Zene Letöltő'
        Window.clearcolor = (0.1, 0.1, 0.1, 1) # Sötét háttér
        
        self.cancellation_flag = threading.Event()
        self.total_songs = 0
        self.completed_songs = 0

        # --- Fő elrendezés ---
        main_layout = BoxLayout(orientation='vertical', padding=25, spacing=15)
        
        main_layout.add_widget(Label(
            text='[ Zene Letöltő ]', 
            font_size='24sp', 
            bold=True, 
            size_hint_y=None, 
            height=50
        ))

        # --- Beállítások (Mappa, Formátum) ---
        settings_layout = GridLayout(cols=2, size_hint_y=None, height=80, spacing=10)
        
        settings_layout.add_widget(Label(text='Mappa neve:', halign='right', font_size='14sp'))
        self.folder_input = TextInput(
            hint_text='Alapértelmezett: "music"', 
            multiline=False, 
            size_hint_y=None, 
            height=40,
            background_color=(0.2, 0.2, 0.2, 1),
            foreground_color=(1, 1, 1, 1),
            hint_text_color=(0.6, 0.6, 0.6, 1)
        )
        settings_layout.add_widget(self.folder_input)
        
        settings_layout.add_widget(Label(text='Formátum:', halign='right', font_size='14sp'))
        self.format_spinner = Spinner(
            text='mp3',
            values=('mp3', 'ogg', 'wav'),
            size_hint_y=None,
            height=40,
            background_color=(0.2, 0.6, 0.8, 1) # Kiemelt szín
        )
        settings_layout.add_widget(self.format_spinner)
        main_layout.add_widget(settings_layout)

        # --- Teljes Lista Letöltése Gomb ---
        self.playlist_button = Button(
            text='Teljes lista letöltése', 
            size_hint_y=None, 
            height=50,
            background_color=(0.2, 0.6, 0.8, 1), # Kék gomb
            font_size='16sp'
        )
        self.playlist_button.bind(on_press=self.start_playlist_download)
        main_layout.add_widget(self.playlist_button)
        
        main_layout.add_widget(Label(text="--- VAGY ---", size_hint_y=None, height=30))

        # --- Egyedi Keresés ---
        self.url_input = TextInput(
            # === MÓDOSÍTÁS: Egyértelműbb hint text ===
            hint_text='Keresőszó VAGY YouTube URL', 
            multiline=False, 
            size_hint_y=None, 
            height=50,
            background_color=(0.2, 0.2, 0.2, 1),
            foreground_color=(1, 1, 1, 1),
            hint_text_color=(0.6, 0.6, 0.6, 1)
        )
        main_layout.add_widget(self.url_input)
        
        self.search_button = Button(
            # === MÓDOSÍTÁS: Egyértelműbb gomb szöveg ===
            text='Letöltés (Keresés / URL)', 
            size_hint_y=None, 
            height=50,
            background_color=(0.3, 0.7, 0.3, 1) # Zöld gomb
        )
        self.search_button.bind(on_press=self.start_search_download)
        main_layout.add_widget(self.search_button)

        # --- Vezérlők és Státusz ---
        self.progress_bar = ProgressBar(max=100, value=0, size_hint_y=None, height=10)
        main_layout.add_widget(self.progress_bar)

        self.status_label = Label(text='Válassz egy opciót...', size_hint_y=None, height=40)
        main_layout.add_widget(self.status_label)
        
        # === MÓDOSÍTÁS: Távtartó (Spacer) ===
        # Ez a widget kitölti a maradék függőleges helyet (size_hint_y=1.0),
        # így az alsó gombok az ablak aljára kerülnek.
        main_layout.add_widget(Widget(size_hint_y=1.0))
        
        # --- Alsó gombsor (Megszakít, Kilép) ---
        bottom_layout = BoxLayout(size_hint_y=None, height=50, spacing=10)
        
        self.cancel_button = Button(
            text='Megszakítás', 
            disabled=True, 
            background_color=(0.8, 0.2, 0.2, 1) # Piros gomb
        )
        self.cancel_button.bind(on_press=self.cancel_download)
        
        self.exit_button = Button(text='Kilépés', background_color=(0.4, 0.4, 0.4, 1))
        self.exit_button.bind(on_press=self.exit_app)
        
        bottom_layout.add_widget(self.cancel_button)
        bottom_layout.add_widget(self.exit_button)
        main_layout.add_widget(bottom_layout)
        
        return main_layout

    def exit_app(self, instance):
        """Alkalmazás bezárása és letöltés megszakítása."""
        self.cancellation_flag.set()
        App.get_running_app().stop()

    def update_status(self, text, is_final=False):
        """Státusz címke frissítése a fő szálon."""
        def update(dt):
            self.status_label.text = text
            if is_final:
                # Visszaállítás zöldre, ha kész
                self.status_label.color = (0, 1, 0, 1) 
        Clock.schedule_once(update)

    def update_progress(self, value):
        """Folyamatjelző frissítése a fő szálon."""
        def update(dt):
            self.progress_bar.value = value
        Clock.schedule_once(update)

    def set_buttons_state(self, is_active):
        """Gombok letiltása/engedélyezése letöltés alatt."""
        self.playlist_button.disabled = is_active
        self.search_button.disabled = is_active
        self.url_input.disabled = is_active
        self.folder_input.disabled = is_active
        self.format_spinner.disabled = is_active
        self.exit_button.disabled = is_active
        self.cancel_button.disabled = not is_active

    def start_download_process(self, song_list):
        """Letöltési folyamat indítása külön szálon."""
        folder_name = self.folder_input.text.strip() or 'music'
        
        self.total_songs = len(song_list)
        self.completed_songs = 0
        self.update_progress(0)
        self.status_label.color = (1, 1, 1, 1) # Státusz szín visszaállítása

        # Becsült idő (30s / dal, 4 szálon)
        est_time_seconds = max(15, (self.total_songs * 30) // 4) 
        est_time_minutes = est_time_seconds // 60
        est_time_remainder = est_time_seconds % 60
        self.update_status(f'Indítás... ({self.total_songs} dal, ~{est_time_minutes}p {est_time_remainder}s)')
        
        self.set_buttons_state(True)
        self.cancellation_flag.clear()
        
        # A letöltő worker indítása külön szálon
        threading.Thread(target=self.download_worker, args=(song_list, folder_name), daemon=True).start()

    def start_playlist_download(self, instance):
        """Teljes lista letöltésének indítása."""
        self.start_download_process(zenek)

    def start_search_download(self, instance):
        """Egyedi keresés letöltésének indítása."""
        query = self.url_input.text.strip()
        if query:
            self.start_download_process([query])
        else:
            self.update_status("Kérlek adj meg egy keresőszót vagy URL-t!")
            self.status_label.color = (1, 0.8, 0, 1) # Figyelmeztető sárga

    def cancel_download(self, instance):
        """Letöltés megszakítása."""
        self.update_status('Megszakítás...')
        self.status_label.color = (1, 0.8, 0, 1) # Sárga
        self.cancellation_flag.set()

    def download_worker(self, zene_lista, folder_name):
        """A háttérben futó letöltési feladat."""
        try:
            downloads_path = storagepath.get_downloads_dir()
            save_path = os.path.join(downloads_path, folder_name)
            os.makedirs(save_path, exist_ok=True)
            
            log_file = os.path.join(save_path, 'download_log.txt')
            
            format_codec = {
                'mp3': {'codec': 'mp3', 'ext': 'mp3', 'quality': '192'},
                'ogg': {'codec': 'vorbis', 'ext': 'ogg', 'quality': '192'},
                'wav': {'codec': 'wav', 'ext': 'wav', 'quality': '0'} # WAV esetén a 'quality' irreleváns
            }
            selected_format = self.format_spinner.text
            codec = format_codec[selected_format]['codec']
            ext = format_codec[selected_format]['ext']
            quality = format_codec[selected_format]['quality']
            
            # --- FÜGGVÉNY A FÜGGVÉNYBEN: Egy dal letöltése ---
            def download_song(zene, index):
                """Egyetlen dal letöltését végző függvény (szálbarát)."""
                if self.cancellation_flag.is_set():
                    return
                
                track_filename_base = f'track{index+1}'
                
                ydl_opts_egyedi = {
                    'format': 'bestaudio/best',
                    'outtmpl': os.path.join(save_path, track_filename_base),
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': codec,
                        'preferredquality': quality
                    }],
                    'noplaylist': True, # Fontos, hogy playlist URL esetén is csak 1 dalt szedjen le
                    'quiet': True,
                    'no_warnings': True,
                    'download_archive': os.path.join(save_path, 'downloaded_archive.txt'),
                }

                try:
                    # === MÓDOSÍTÁS: URL vagy Keresés felismerése ===
                    zene_clean = zene.strip()
                    download_target = ""
                    # Egyszerű ellenőrzés: ha 'http'-vel kezdődik vagy 'youtu.be' szerepel benne, az URL.
                    if zene_clean.startswith('http') or 'youtu.be' in zene_clean:
                        download_target = zene_clean
                    else:
                        # Különben keresőszó
                        download_target = f"ytsearch1:{zene_clean} audio"
                    # === MÓDOSÍTÁS VÉGE ===

                    with yt_dlp.YoutubeDL(ydl_opts_egyedi) as ydl:
                        # 'download_target' használata a korábbi 'search_query' helyett
                        ydl.download([download_target])
                    
                    # Sikeres letöltés jelzése a logban
                    with open(log_file, 'a', encoding='utf-8') as f:
                        f.write(f"✔ Kész: {track_filename_base}.{ext} ({zene})\n")
                    
                    status_msg = f"✔ {zene[:30]}..."

                except Exception as e:
                    # Sikertelen letöltés jelzése
                    with open(log_file, 'a', encoding='utf-8') as f:
                        f.write(f"❌ Hiba: {zene} -> {str(e)}\n")
                    
                    status_msg = f"❌ Hiba: {zene[:30]}..."
                
                finally:
                    # Frissítjük a folyamatjelzőt és a státuszt (mindenképp)
                    if not self.cancellation_flag.is_set():
                        self.completed_songs += 1
                        progress = (self.completed_songs / self.total_songs) * 100
                        Clock.schedule_once(lambda dt: self.update_progress(progress))
                        
                        if self.completed_songs % 5 == 0 or self.completed_songs == self.total_songs:
                            Clock.schedule_once(lambda dt, msg=status_msg: self.update_status(f"({self.completed_songs}/{self.total_songs}) {msg}"))
            
            # --- Letöltés indítása ThreadPoolExecutorral ---
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = [executor.submit(download_song, zene, index) for index, zene in enumerate(zene_lista)]
                
                while any(f.running() for f in futures):
                    if self.cancellation_flag.is_set():
                        executor.shutdown(wait=False, cancel_futures=True)
                        break
                    threading.Event().wait(0.5)

            # --- Letöltés vége ---
            if self.cancellation_flag.is_set():
                self.update_status('Letöltés megszakítva.', is_final=True)
                self.status_label.color = (1, 0.8, 0, 1) # Sárga
            else:
                self.update_status(f"🎉 Kész! {self.total_songs} dal a '{folder_name}' mappában.", is_final=True)

        except Exception as e:
            self.update_status(f"Kritikus hiba: {str(e)[:100]}")
            self.status_label.color = (1, 0, 0, 1) # Piros
        finally:
            # Gombok visszaállítása a fő szálon
            Clock.schedule_once(lambda dt: self.set_buttons_state(False))

if __name__ == '__main__':
    DownloaderApp().run()
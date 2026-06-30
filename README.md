# ArenaTracker

ArenaTracker to lokalna aplikacja do śledzenia sesji League of Legends Arena. Działa w dwóch trybach:

- offline, po otwarciu `index.html`, z zapisem w `localStorage`;
- z backendem, po uruchomieniu `node server.js`, z kontami użytkowników, zapisem JSON i opcjonalną synchronizacją Riot API.

## Uruchomienie

Bez backendu:

```powershell
start index.html
```

Z backendem:

```powershell
node server.js
```

Potem wejdź na `http://127.0.0.1:4173/`.

## Riot Sync

Synchronizacja działa przez oficjalne Riot API, nie przez OP.GG. Ustaw klucz developerski w `.env`:

```powershell
Copy-Item .env.example .env
```

W `.env` wpisz:

```text
RIOT_API_KEY=RGAPI-your-development-key
```

Następnie uruchom serwer ponownie. W aplikacji kliknij `Konto` w prawym górnym rogu, utwórz konto, zapisz Riot ID w panelu profilu i kliknij `Synchronizuj Arenę`.

Import korzysta z:

- Account-V1: Riot ID -> PUUID;
- Match-V5: historia meczów po PUUID;
- kolejek Arena `1700` i `1710`.

## Funkcje

- Minimalistyczny dashboard z progressem wygranych championów.
- Kolekcja pokazująca wyłącznie championów, którymi masz już pierwsze miejsce.
- Wyszukiwarka w zakładce `Wygrane`, oparta o listę wygranych championów i ich ikony.
- Historia meczów pobrana z synchronizacji Riot API lub importu JSON.
- Konto lokalne, logowanie, rejestracja i reset hasła przez link wysyłany na e-mail.
- Import i eksport danych JSON.
- Import meczów Arena z Riot Match-V5, jeśli `RIOT_API_KEY` jest ustawiony.

## Założenia

- Backend używa tylko wbudowanych modułów Node i zapisuje dane w `data/arenatracker-db.json`.
- Hasła są haszowane przez `scrypt`; sesje są lokalnymi ciasteczkami HTTP-only i wygasają po 7 dniach.
- W trybie lokalnym linki resetowania hasła trafiają do `data/password-reset-outbox.json`; w środowisku produkcyjnym to miejsce należy podpiąć pod SMTP lub usługę e-mail.
- Dane w `data/` i `.env` nie są commitowane.
- Lista startowa bohaterów korzysta z Riot Data Dragon `16.13.1`, sprawdzonego 2026-06-30.
- ArenaTracker nie pokazuje win rate'ów augmentów ani itemów dla Areny.
- Grafika nagłówka jest nieoficjalnym, wygenerowanym assetem projektu. Nie używa logo, bohaterów ani oficjalnych materiałów Riot Games.

League of Legends jest znakiem towarowym Riot Games. ArenaTracker jest fanowskim narzędziem i nie jest powiązany z Riot Games.

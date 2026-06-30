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

Następnie uruchom serwer ponownie. W aplikacji kliknij `Konto` w prawym górnym rogu, utwórz konto i zapisz konto League. Od tego momentu ArenaTracker synchronizuje Arenę automatycznie przy wejściu na stronę.

Import korzysta z:

- Account-V1: nazwa + tag -> PUUID;
- Summoner-V4: profilowa ikonka konta League;
- Match-V5: historia meczów po PUUID;
- aktualnej kolejki Arena 3x6 `1750`.

## Funkcje

- Minimalistyczny dashboard z progressem wygranych championów.
- Kolekcja championów z filtrami: szukaj championa, wygrani, brakujący, wszyscy, A-Z i liczba winów.
- Szczegóły championa po kliknięciu karty: gry, wygrane, najczęstszy duet, najlepszy patch i historia.
- Historia meczów oraz statystyki partnerów z Areny z automatycznej synchronizacji Riot API.
- Konto lokalne, logowanie, rejestracja i reset hasła przez link wysyłany na e-mail.
- Import meczów Arena 3x6 z Riot Match-V5, jeśli `RIOT_API_KEY` jest ustawiony.

## Założenia

- Backend używa tylko wbudowanych modułów Node i zapisuje dane w `data/arenatracker-db.json`.
- Hasła są haszowane przez `scrypt`; sesje są lokalnymi ciasteczkami HTTP-only i wygasają po 7 dniach.
- W trybie lokalnym linki resetowania hasła trafiają do `data/password-reset-outbox.json`; w środowisku produkcyjnym to miejsce należy podpiąć pod SMTP lub usługę e-mail.
- Dane w `data/` i `.env` nie są commitowane.
- Lista startowa bohaterów korzysta z Riot Data Dragon `16.13.1`, sprawdzonego 2026-06-30.
- ArenaTracker nie pokazuje win rate'ów augmentów ani itemów dla Areny.
- Grafika nagłówka jest nieoficjalnym, wygenerowanym assetem projektu. Nie używa logo, bohaterów ani oficjalnych materiałów Riot Games.

League of Legends jest znakiem towarowym Riot Games. ArenaTracker jest fanowskim narzędziem i nie jest powiązany z Riot Games.

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

Następnie uruchom serwer ponownie. W aplikacji przejdź do `Konto`, utwórz konto, zapisz Riot ID i kliknij `Synchronizuj Arenę`.

Import korzysta z:

- Account-V1: Riot ID -> PUUID;
- Match-V5: historia meczów po PUUID;
- kolejek Arena `1700` i `1710`.

## Funkcje

- Dashboard z liczbą gier, średnim miejscem, top 2 rate, win rate i zmianą ratingu.
- Formularz zapisu meczu: data, patch, bohater, partner, miejsce, rating, augmenty, itemy i notatka.
- Historia meczów z filtrami po patchu, bohaterze i zakresie czasu.
- Tabela bohaterów z agregacją średniego miejsca, top 2, duetów i częstości augmentów.
- Planner draftu na bazie zapisanych prób danego bohatera albo duetu.
- Konto lokalne, import i eksport danych JSON.
- Import meczów Arena z Riot Match-V5, jeśli `RIOT_API_KEY` jest ustawiony.

## Założenia

- Backend używa tylko wbudowanych modułów Node i zapisuje dane w `data/arenatracker-db.json`.
- Hasła są haszowane przez `scrypt`; sesje są lokalnymi ciasteczkami HTTP-only i wygasają po 7 dniach.
- Dane w `data/` i `.env` nie są commitowane.
- Lista startowa bohaterów korzysta z Riot Data Dragon `16.13.1`, sprawdzonego 2026-06-30.
- ArenaTracker nie pokazuje win rate'ów augmentów ani itemów dla Areny.
- Grafika nagłówka jest nieoficjalnym, wygenerowanym assetem projektu. Nie używa logo, bohaterów ani oficjalnych materiałów Riot Games.

League of Legends jest znakiem towarowym Riot Games. ArenaTracker jest fanowskim narzędziem i nie jest powiązany z Riot Games.

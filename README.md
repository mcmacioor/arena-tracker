# ArenaTracker

ArenaTracker to lokalna aplikacja statyczna do śledzenia sesji League of Legends Arena. Projekt działa bez backendu i zapisuje dane w przeglądarce, dzięki czemu można szybko notować mecze, duety, augmenty, itemy i wnioski po sesji.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Aplikacja nie wymaga instalowania zależności.

## Funkcje

- Dashboard z liczbą gier, średnim miejscem, top 2 rate, win rate i zmianą ratingu.
- Formularz zapisu meczu: data, patch, bohater, partner, miejsce, rating, augmenty, itemy i notatka.
- Historia meczów z filtrami po patchu, bohaterze i zakresie czasu.
- Tabela bohaterów z agregacją średniego miejsca, top 2, duetów i augmentów.
- Planner draftu na bazie zapisanych prób danego bohatera albo duetu.
- Import i eksport danych JSON.

## Założenia

- Dane użytkownika są przechowywane lokalnie w `localStorage`.
- Lista startowa bohaterów korzysta z Riot Data Dragon `16.13.1`, sprawdzonego 2026-06-30.
- Grafika nagłówka jest nieoficjalnym, wygenerowanym assetem projektu. Nie używa logo, bohaterów ani oficjalnych materiałów Riot Games.

League of Legends jest znakiem towarowym Riot Games. ArenaTracker jest fanowskim narzędziem i nie jest powiązany z Riot Games.

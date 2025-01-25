## Music app

- [Сайт](https://musicapp.fun) (Для входа нажмите **"Login as guest"**)
- [Документация API](https://musicapp.fun/api/docs)
- [Backend код](https://gitlab.com/unveo/music-app-backend)
- [Frontend код](https://gitlab.com/unveo/music-app-frontend)

## Основные возможности

- **Треки, альбомы и плейлисты**:
  - Слушать, создавать, изменять и удалять.
  - Добавлять треки и альбомы в "понравившиеся".
  - Сохранять плейлисты других пользователей.
  - Изменять позиции треков в плейлистах и альбомах.
- **Подписки и уведомления**:
  - Подписываться на других пользователей.
  - Получать уведомления о новых треках и альбомах.
- **Логика проигрывания**:
  - 4 типа очереди: плейлист, альбом, понравившиеся треки, треки исполнителя.
  - Полное сохранение состояния прослушивания.
  - История прослушивания.

## Используемые технологии

- **Backend:** NestJS, Prisma, PostgreSQL, Redis, Elasticsearch, Docker, Nginx, Ffmpeg.
- **Frontend:** Next.js, TailwindCSS, React-query, Axios, React-hook-form, Zod, Zustand, Shadcn/ui.

## Архитектура и особенности

### Backend:

- Авторизация с JWT токенами (access и refresh). ([auth module](https://gitlab.com/unveo/music-app-backend/-/tree/main/src/auth))
- Валидация, документация и т.д.
- Кэширование с Redis.
- Поиск через Elasticsearch (Bonsai.io).
- Нормализация громкости и конвертация аудиофайлов в `.webm` с помощью Ffmpeg. ([file module](https://gitlab.com/unveo/music-app-backend/-/blob/main/src/file/file.service.ts))
- Загрузка аудио и изображений в облако Cloudinary.
- Деплой на VPS с использованием Docker.

### Frontend:

- Сложная логика проигрывания треков, полный функционал плеера. ([play-track.tsx](https://gitlab.com/unveo/music-app-frontend/-/blob/main/hooks/play-track.tsx), [player.tsx](https://gitlab.com/unveo/music-app-frontend/-/blob/main/hooks/player.tsx))
- Валидация данных.
- Деплой через Vercel.

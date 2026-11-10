# Issue Log dan Report TXT

Dashboard memiliki endpoint `GET/POST /api/issues` untuk menyimpan temuan dan `GET /api/issues/:id` untuk mengunduh report sebagai `flop-issue-<id>.txt`. Tambahkan `?format=md` untuk menghasilkan `flop-issue-<id>.md` yang siap dipakai di GitHub Issue atau security advisory.

Isi report disimpan di kolom `report_text` pada tabel `bot_issues`. Ini sengaja dilakukan karena filesystem serverless Vercel tidak persisten. File teks dibuat ulang saat endpoint download dipanggil, sehingga report tetap tersedia setelah deployment atau restart.

Form otomatis membersihkan control character dan meredaksi pola token GitHub, API key, `SIGN_SEED`, `PRIVATE_KEY`, `SECRET`, `BEARER`, serta blok PEM. Redaksi bukan pengganti review manual; jangan menempelkan private key atau token ke form.

Temuan consensus, verifikasi, ekonomi, session, escrow, HTLC, data availability, atau bug yang dapat merugikan pihak lain harus dilaporkan melalui kanal keamanan privat FLOP, bukan issue publik biasa.

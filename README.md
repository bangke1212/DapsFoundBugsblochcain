

## Auto Swap Automation

Menu **Automation** sekarang memiliki Auto Swap Safe Runner untuk membuat job berulang dengan guardrail tetap:

- Maksimal dan wajib **5 transaksi per job**.
- Cooldown dapat dipilih **1 jam, 6 jam, atau 12 jam** (masing-masing 3600, 21600, atau 43200 detik).
- Custom network adder dengan nama, RPC URL, chain ID, symbol native, explorer URL, dan router address.
- Validasi RPC hanya menerima `http(s)` tanpa username, password, atau query secret.
- Mode default dan satu-satunya mode operasional saat ini adalah **dry-run**.
- Tombol pause, resume, cancel, dan run one cycle.
- Execution log menyimpan attempt, status, timestamp, dan pesan simulasi.
- Vercel Cron `/api/auto-swap/tick` dijadwalkan setiap jam.

Mode dry-run **tidak mengirim transaksi blockchain, tidak memegang private key, dan tidak melakukan wallet signing**. Mode `live` sengaja dikunci oleh backend sampai adapter wallet dan router yang diaudit ditambahkan untuk network yang benar-benar diizinkan.

Endpoint:

```text
GET   /api/custom-networks
POST  /api/custom-networks
GET   /api/auto-swap
POST  /api/auto-swap
GET   /api/auto-swap/:id
PATCH /api/auto-swap/:id       # run, pause, resume, cancel
GET   /api/auto-swap/tick     # Vercel Cron only
```

Untuk deployment production, `DATABASE_URL` wajib dikonfigurasi agar custom network, job, cooldown, dan execution log tidak hilang ketika Function restart. Jangan memasukkan private key ke custom network form, RPC URL, frontend, atau repository.


## FLOP Devnet connection

Dashboard memiliki panel **Devnet connection** pada menu `Identity & check-in`. Panel ini memverifikasi faucet metadata resmi, memanggil `chain_getBlockHash(0)` ke RPC FLOP, mencocokkan genesis `0x99c172c095340ace980631f9123544c6bebd4839f3437e463533422d8be2d631`, dan membaca model catalog publik. Semua request dibuat server-side melalui `/api/flop/status`; `SIGN_SEED` tidak dikirim ke browser.

Endpoint resmi yang dipakai adalah `https://rpc.devnet.flop.network` untuk request HTTP satu kali dan `wss://rpc.devnet.flop.network` sebagai endpoint WebSocket, dengan gateway `https://api.flop.network`. Nilai tersebut dapat dioverride melalui `FLOP_RPC_HTTP`, `FLOP_RPC_WSS`, dan `FLOP_GATEWAY_URL`.

FLOP belum menerbitkan endpoint login publik terpisah. Karena itu aplikasi tidak mengklaim bahwa signed check-in Technocore adalah login on-chain FLOP. Check-in tetap merupakan signed HTTP message ke Technocore, sedangkan panel FLOP hanya memverifikasi kesiapan koneksi devnet dan DID. Integrasi inference atau transaksi harus mengikuti SDK dan alur resmi FLOP setelah akses serta kredensial yang diperlukan tersedia.

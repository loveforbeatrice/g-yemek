# Gülbahçe Yemek Web Uygulaması

Bu proje, Gülbahçe Yemek için geliştirilen web uygulamasıdır. React frontend ve Node.js backend kullanılarak geliştirilmiştir.

## Proje Yapısı

Proje monorepo yapısında düzenlenmiştir ve aşağıdaki ana modülleri içerir:

- `packages/frontend`: React tabanlı frontend uygulaması
- `packages/backend`: Node.js tabanlı backend uygulaması

## Geliştirme Ortamı Kurulumu

1. Node.js ve npm'in yüklü olduğundan emin olun
2. PostgreSQL veritabanını kurun ve çalıştırın
3. Projeyi klonlayın
4. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
5. Geliştirme sunucusunu başlatın:
   ```bash
   npm start
   ```

## Modül Geliştirme

Her modül kendi dizininde bağımsız olarak geliştirilebilir. Modül dizinine gidip aşağıdaki komutları kullanabilirsiniz:

```bash
cd packages/[modül-adı]
npm install
npm start
```

## Veritabanı Yapılandırması

PostgreSQL veritabanı bağlantı bilgileri `.env` dosyasında yapılandırılmalıdır. 
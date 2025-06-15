import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  tr: {
    // Auth & Login
    welcome: 'GÜLBAHÇE\'NİN 1 NUMARALI',
    gülbahce: 'YEMEK SİPARİŞ PLATFORMUNA',
    foodPlatform: 'HOŞ GELDİNİZ',    welcomeTo: 'HOŞ GELDİNİZ', 
    businessPortalLine1: 'GÜLBAHÇE YEMEK', // Üç satırlı başlık - satır 1 
    businessPortalLine2: 'İŞLETME PORTALINA', // Üç satırlı başlık - satır 2
    businessPortalLine3: 'HOŞ GELDİNİZ', // Üç satırlı başlık - satır 3
    gülbahceYemek: 'GÜLBAHÇE YEMEK',
    ifYouDontHaveAccount: 'Hesabınız Yoksa',
    notABusiness: 'İşletme Değil misiniz?',
    signIn: 'GİRİŞ YAP',
    signUp: 'KAYIT OL',
    alreadyHaveAccount: 'Zaten Hesabınız Var Mı?',
    dontHaveAccount: 'Hesabınız Yok Mu?',
    areYouBusiness: 'İşletme misiniz?',
    businessPortal: 'İŞLETME PORTALI',
    userPortal: 'KULLANICI PORTALI',
    createAccount: 'HESAP OLUŞTUR',
    businessName: 'İşletme Adı',
    fullName: 'Ad Soyad',    phoneNumber: 'Telefon Numarası',
    phoneNumberPlaceholder: 'Telefon Numarası (5XX XXX XX XX)',    phoneNumberMinimal: '5xxxxxxxxx',
    phoneHelperText: '10 haneli telefon numaranızı girin',
    newPassword: 'Yeni şifre',
    confirmNewPassword: 'Yeni şifre tekrar',
    password: 'Şifre',
    confirmPassword: 'Şifre Tekrar',
    forgotPassword: 'Şifremi Unuttum?',
    forgotPassword: 'Şifremi Unuttum?',
    resetPassword: 'Şifre Sıfırlama',
    verificationCode: 'Doğrulama Kodu',
    newPassword: 'Yeni Şifre',
    sendCode: 'Kod Gönder',
    verify: 'Doğrula',
    changePasswordButton: 'Şifreyi Değiştir',
    resetPasswordInstruction: 'Şifrenizi sıfırlamak için telefon numaranızı girin',
    resetCodeSent: 'numarasına gönderilen 6 haneli kodu girin',
    setNewPassword: 'Yeni şifrenizi belirleyin',
    passwordResetSuccess: 'Şifre başarıyla değiştirildi',
    invalidResetCode: 'Geçersiz kod',
    passwordResetFailed: 'Şifre değiştirilemedi',
    business: 'İşletme',
    or: '— veya —',
    
    // OTP
    phoneVerification: 'Telefon Doğrulama',
    verificationCodeSent: 'numarasına gönderilen 6 haneli kodu girin',
    verifyAndCreate: 'Doğrula ve Hesabı Oluştur',
    resendCode: 'Kodu Tekrar Gönder',
    waitToResend: 'Yeni kod gönderebilmek için {time} saniye bekleyin',
    cancel: 'İptal',
    
    // Messages
    loginSuccess: 'Giriş başarılı! Restoranlar sayfasına yönlendiriliyorsunuz.',
    signupSuccess: 'Kayıt başarılı!',
    verificationCodeSending: 'Doğrulama kodu gönderiliyor...',
    verificationCodeSentMsg: 'Doğrulama kodu telefonunuza gönderildi.',
    newVerificationCodeSent: 'Yeni doğrulama kodu gönderildi.',
    fillAllFields: 'Lütfen tüm alanları doldurun.',
    passwordsNotMatch: 'Şifreler eşleşmiyor.',
    enterVerificationCode: 'Lütfen 6 haneli doğrulama kodunu tam olarak girin.',
    invalidCredentials: 'Geçersiz kullanıcı bilgileri',
    loginFailed: 'Giriş yapılamadı',
    error: 'Bir hata oluştu',
      // Navigation & Menu
    restaurants: 'Restoranlar',
    menu: 'Menü',
    basket: 'Sepet',
    cart: 'Sepet',
    favorites: 'Favoriler',
    profile: 'Profil',
    addresses: 'Adresler',    orders: 'Siparişler',
    settings: 'Ayarlar',
      // Business Portal
    businessOrders: 'İşletme Siparişleri',
    businessMenu: 'İşletme Menüsü',
    businessSettings: 'İşletme Ayarları',
    orderHistory: 'Sipariş Geçmişi',
    
    // Business Settings
    businessSettingsTitle: 'İŞLETME AYARLARI',
    businessName: 'İşletme Adı',
    businessHours: 'Çalışma Saatleri',
    openingTime: 'Açılış Saati',
    closingTime: 'Kapanış Saati',
    businessImage: 'İşletme Resmi',
    uploadImage: 'Resim Yükle',
    languageSettings: 'Dil Ayarları',
    selectLanguage: 'Dil Seçin',
    saveSettings: 'KAYDET',    businessImageUpdated: 'İşletme resmi başarıyla güncellendi',
    imageUploadError: 'Resim yüklenirken bir hata oluştu',
    settingsLoadError: 'İşletme ayarları yüklenemedi. Lütfen daha sonra tekrar deneyin.',
    businessSettingsUpdated: 'İşletme ayarları başarıyla güncellendi',
    changePasswordButton: 'ŞİFREYİ DEĞİŞTİR',
    deleteAccountConfirm: 'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
    yesDelete: 'Evet, Sil',
    
    // Settings
    notifications: 'Bildirimler',
    language: 'Dil',
    theme: 'Tema',
    allowPushNotifications: 'Anlık bildirimlere izin ver',
    allowPullNotifications: 'Çekme bildirimlerine izin ver',
    allowPromotionNotifications: 'Promosyon bildirimlerine izin ver',
    useDeviceTheme: 'Cihaz temasını kullan',
    original: 'Orijinal',
    dark: 'Koyu',
    turkish: 'Türkçe',
    english: 'İngilizce',
    
    // Restaurants Page
    restaurantsNotLoaded: 'Restoranlar yüklenemedi.',
    searchRestaurant: 'Restoran ara',
    closedNow: 'Şu an kapalı',
    phone: 'Telefon',
    email: 'E-posta',
    noResultsFound: 'Sonuç bulunamadı.',
      // Menu Page
    filter: 'Filtrele',
    sort: 'Sırala',
    category: 'Kategori',
    all: 'Tümü',
    minPrice: 'Min Fiyat',
    maxPrice: 'Max Fiyat',
    applyFilters: 'Filtreleri Uygula',
    resetFilters: 'Filtreleri Sıfırla',    addToBasket: 'Sepete Ekle',
    addToCart: 'Sepete Ekle',
    removeFromBasket: 'Sepetten Çıkar',
    removeFromCart: 'Sepetten Çıkar',
    addedToBasket: 'Sepete eklendi',
    addedToCart: 'Sepete eklendi',
    removedFromBasket: 'Sepetten çıkarıldı',
    removedFromCart: 'Sepetten çıkarıldı',
    addedToFavorites: 'Favorilere eklendi',
    removedFromFavorites: 'Favorilerden çıkarıldı',
    restaurantClosed: 'Restoran şu anda kapalı',
    restaurantClosedCannotOrder: 'İşletme şu anda kapalı olduğu için sipariş veremezsiniz.',
    noMenuItems: 'Bu işletmeye ait menü bulunamadı.',
    sortByNameAsc: 'İsim (A-Z)',
    sortByNameDesc: 'İsim (Z-A)',
    sortByPriceAsc: 'Fiyat (Düşük-Yüksek)',
    sortByPriceDesc: 'Fiyat (Yüksek-Düşük)',
      // Profile Page
    editProfile: 'Profili Düzenle',
    accountDetails: 'Hesap Detayları',
    name: 'Ad',
    fullName: 'Ad Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    edit: 'Düzenle',
    save: 'Kaydet',
    cancel: 'İptal',
    changePassword: 'Şifre Değiştir',
    currentPassword: 'Mevcut Şifre',
    newPassword: 'Yeni Şifre',
    confirmNewPassword: 'Yeni Şifre Tekrar',
    updatePassword: 'Şifreyi Güncelle',
    changing: 'Değiştiriliyor...',
    deleteAccount: 'Hesabı Sil',
    deleteAccountTitle: 'Hesabı Sil',
    deleteAccountWarning: 'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    confirmDelete: 'Evet, Sil',
    profileUpdated: 'Bilgi güncellendi.',
    passwordUpdated: 'Şifre başarıyla değiştirildi.',
    accountDeleted: 'Hesabınız silindi. Oturum kapatılıyor...',
    goBack: 'Geri Dön',
    userInfoNotLoaded: 'Kullanıcı bilgileri alınamadı.',
    updateFailed: 'Güncelleme başarısız.',
    passwordChangeFailed: 'Şifre değiştirilemedi.',
    deleteAccountFailed: 'Hesap silinemedi.',    // Common
    loading: 'Yükleniyor...',
    close: 'Kapat',
    confirm: 'Onayla',
    yes: 'Evet',
    no: 'Hayır',
    success: 'Başarılı',
    warning: 'Uyarı',
    info: 'Bilgi',
    quantity: 'Adet',
    price: 'Fiyat',
    total: 'Toplam',
    search: 'Ara',
    home: 'Ana Sayfa',
    logout: 'Çıkış Yap',
    login: 'Giriş',
    register: 'Kayıt Ol',
    range: 'Aralığı',
    min: 'Min',
    max: 'Max',
    apply: 'Uygula',
    reset: 'Sıfırla',    // Header & Navigation
    myBasket: 'Sepetim',
    myCart: 'Sepetim',
    emptyBasket: 'Sepetiniz boş',
    emptyCart: 'Sepetiniz boş',
    goToBasket: 'SEPETE GİT',
    goToCart: 'SEPETE GİT',
    guestUser: 'Misafir Kullanıcı',
    pleaseLogin: 'Giriş yapınız',
    accountDetails: 'Hesap Detayları',
    myAddresses: 'Adreslerim',
    orderHistory: 'Sipariş Geçmişi',
    logOut: 'Çıkış Yap',
    
    // Cart/Basket Page
    cartTitle: 'Sepetim',
    emptyCartMessage: 'Sepetiniz boş',
    emptyCartSubtext: 'Siparişinizi tamamlamak için menüdan ürün ekleyin',
    backToMenu: 'Menüye Dön',
    orderSummary: 'Sipariş Özeti',
    subtotal: 'Ara Toplam',
    deliveryFee: 'Teslimat Ücreti',
    totalAmount: 'Toplam Tutar',
    deliveryAddress: 'Teslimat Adresi',
    selectAddress: 'Adres Seçin',
    addNewAddress: 'Yeni Adres Ekle',
    orderNote: 'Sipariş Notu',
    orderNotePlaceholder: 'Siparişiniz hakkında özel bir isteğiniz varsa buraya yazabilirsiniz...',
    completeOrder: 'Siparişi Tamamla',
    orderSuccess: 'Sipariş Başarılı',
    orderSuccessMessage: 'Siparişiniz başarıyla alındı!',
    
    // Orders Page
    orders: {
      title: 'Sipariş Geçmişim',
      noOrders: 'Henüz sipariş geçmişiniz bulunmamaktadır.',
      loadError: 'Sipariş geçmişi yüklenirken bir hata oluştu.',
      addedToCart: 'Tüm ürünler sepete eklendi!',
      unknownBusiness: 'Bilinmeyen İşletme',
      pieces: 'adet',
      note: 'Not',
      total: 'Toplam',
      addAllToCart: 'Tümünü Sepete Ekle'
    },
    
    // Addresses Page
    addresses: {
      title: 'Adreslerim',
      noAddresses: 'Henüz adres eklenmemiş. Yeni bir adres ekleyin.',
      loadError: 'Adresler yüklenemedi. Lütfen daha sonra tekrar deneyin.',
      addNew: 'Yeni Adres Ekle',
      edit: 'Adresi Düzenle',
      addSuccess: 'Adres başarıyla eklendi.',
      addError: 'Adres eklenirken bir hata oluştu.',
      updateSuccess: 'Adres başarıyla güncellendi.',
      updateError: 'Adres güncellenirken bir hata oluştu.',
      deleteConfirm: 'Bu adresi silmek istediğinizden emin misiniz?',
      deleteSuccess: 'Adres başarıyla silindi.',
      deleteError: 'Adres silinirken bir hata oluştu.'
    },
    
    // Business Orders Page
    businessOrders: {
      title: 'SİPARİŞLER',
      loadError: 'Siparişler yüklenemedi.',
      ordersConfirmed: 'Siparişler onaylandı.',
      ordersNotConfirmed: 'Siparişler onaylanamadı.',
      orderRejected: 'Sipariş reddedildi.',
      orderNotRejected: 'Sipariş reddedilemedi.',
      ordersDelivered: 'Siparişler teslim edildi olarak işaretlendi.',
      ordersNotDelivered: 'Siparişler teslim edilemedi.',
      customer: 'Müşteri',
      note: 'Not',
      total: 'Toplam',
      confirm: 'ONAYLA',
      reject: 'REDDET',
      rejectConfirm: 'Siparişi Reddet',
      rejectWarning: 'Bu siparişi reddetmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      yes: 'Evet',
      no: 'Hayır',
      noIdleOrders: 'Bekleyen sipariş yok.',
      noAwaitingDelivery: 'Teslim bekleyen sipariş yok.',
      idleOrders: 'Bekleyen Siparişler',
      awaitingDelivery: 'Teslim Bekleyenler',
      markAsDelivered: 'Teslim Edildi',
      soundNotifications: 'Sesli Bildirimler',
      soundOn: 'Açık',
      soundOff: 'Kapalı',
      soundTip: 'Yeni siparişler için sesli bildirimleri aç/kapat',
      newOrderArrived: 'Yeni sipariş alındı! Bekleyen siparişler: {count}',
      browserBlockedSound: 'Tarayıcınız otomatik ses çalmayı engelliyor. Lütfen sayfada herhangi bir yere tıklayın ve tekrar deneyin.',
      enableSoundNotifications: 'Sesli bildirimleri etkinleştirmek için tıklayın',
      soundPermissionRequired: 'Ses İzni Gerekli',
      soundPermissionMessage: 'Tarayıcınızın ses çalması için etkileşim gerektiriyor. Lütfen bildirimleri etkinleştirmek için sayfaya tıklayın.',
      testNotification: 'Test Bildirimi',
      enableNotifications: 'Bildirimleri Etkinleştir'
    },
      // Business Performance Page
    businessPerformance: {
      title: 'Performans Analizi',
      subtitle: 'İşletme Performans Panosu',
      loadError: 'Veriler yüklenirken bir hata oluştu',
      daily: 'Günlük',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      totalRevenue: 'Toplam Gelir',
      totalOrders: 'Toplam Sipariş',
      avgOrderValue: 'Ort. Sipariş Değeri',
      salesTrends: 'Satış Trendleri',
      revenue: 'Gelir',
      orders: 'Siparişler',
      revenueChart: 'Gelir (₺)',
      ordersChart: 'Siparişler',
      noSalesData: 'Seçilen dönem için satış verisi bulunmuyor',
      topProducts: 'En Çok Satan Ürünler',
      bestSelling: 'En Çok Satılan',
      highestRevenue: 'En Çok Kazandıran',
      sales: 'Satış',
      noProductData: 'Ürün satış verisi bulunmuyor',
      favoritesAnalysis: 'Favori Analizi',
      noFavoritesData: 'Favori verisi bulunmuyor'
    },
    
    // Address Form Dialog
    addressForm: {
      nameLabel: 'Adres Başlığı',
      detailLabel: 'Adres Detayı',
      cancel: 'İptal',
      save: 'Kaydet'
    },
    
    // Business Order History Page
    businessOrderHistory: {
      title: 'SİPARİŞ GEÇMİŞİ',
      loadError: 'Sipariş geçmişi yüklenemedi.',
      delivered: 'Teslim Edildi',
      pending: 'Beklemede',
      noHistory: 'Geçmiş sipariş yok.',
      note: 'Not',
      total: 'Toplam'
    },
    
    // Business Layout (Sidebar Menu)
    businessLayout: {
      orders: 'Siparişler',
      orderHistory: 'Sipariş Geçmişi',
      menu: 'Menü',
      performance: 'Performans',
      settings: 'Ayarlar',
      exit: 'Çıkış',
      businessName: 'İşletme Adı'
    },
    
    // Restaurant Status Widget
    restaurantStatus: {
      open: 'AÇIK',
      closed: 'KAPALI',
      clickToClose: 'Kapatmak için tıklayın',
      clickToOpen: 'Açmak için tıklayın'
    }
  },  en: {
    // Auth & Login
    welcome: 'WELCOME TO',
    gülbahce: 'GÜLBAHÇE\'S #1',
    foodPlatform: 'FOOD ORDERING PLATFORM',    welcomeTo: 'WELCOME TO',
    businessPortalLine1: 'WELCOME TO', // Üç satırlı başlık - satır 1
    businessPortalLine2: 'GÜLBAHÇE YEMEK', // Üç satırlı başlık - satır 2
    businessPortalLine3: 'BUSINESS PORTAL', // Üç satırlı başlık - satır 3
    gülbahceYemek: 'GÜLBAHÇE YEMEK',
    ifYouDontHaveAccount: 'If You Don\'t Have An Account',
    notABusiness: 'Not A Business?',
    signIn: 'SIGN IN',
    signUp: 'SIGN UP',
    alreadyHaveAccount: 'Already Have An Account?',
    dontHaveAccount: 'If You Don\'t Have An Account',
    areYouBusiness: 'Are You A Business?',
    businessPortal: 'BUSINESS PORTAL',
    userPortal: 'USER PORTAL',
    createAccount: 'CREATE ACCOUNT',
    businessName: 'Business Name',
    fullName: 'Full Name',    phoneNumber: 'Phone Number',
    phoneNumberPlaceholder: 'Phone Number (5XX XXX XX XX)',    phoneNumberMinimal: '5xxxxxxxxx',
    phoneHelperText: 'Enter your 10-digit phone number',
    newPassword: 'New password',
    confirmNewPassword: 'Confirm password',
    password: 'Password',
    confirmPassword: 'Confirm Password',forgotPassword: 'Forgot password?',
    resetPassword: 'Password Reset',
    verificationCode: 'Verification Code',
    newPassword: 'New Password',
    sendCode: 'Send Code',
    verify: 'Verify',
    changePasswordButton: 'Change Password',
    resetPasswordInstruction: 'Enter your phone number to reset your password',
    resetCodeSent: 'Enter the 6-digit code sent to',
    setNewPassword: 'Set your new password',
    passwordResetSuccess: 'Password changed successfully',
    invalidResetCode: 'Invalid code',
    passwordResetFailed: 'Password could not be changed',
    business: 'Business',
    or: '— or —',
    
    // OTP
    phoneVerification: 'Phone Verification',
    verificationCodeSent: 'Enter the 6-digit code sent to',
    verifyAndCreate: 'Verify & Create Account',
    resendCode: 'Resend Code',
    waitToResend: 'Wait {time} seconds to resend new code',
    cancel: 'Cancel',
    
    // Messages
    loginSuccess: 'Login successful! Redirecting to restaurants page.',
    signupSuccess: 'Registration successful!',
    verificationCodeSending: 'Sending verification code...',
    verificationCodeSentMsg: 'Verification code sent to your phone.',
    newVerificationCodeSent: 'New verification code sent.',
    fillAllFields: 'Please fill all fields.',
    passwordsNotMatch: 'Passwords do not match.',
    enterVerificationCode: 'Please enter the complete 6-digit verification code.',
    invalidCredentials: 'Invalid credentials',
    loginFailed: 'Login failed',
    error: 'An error occurred',
      // Navigation & Menu
    restaurants: 'Restaurants',
    menu: 'Menu',
    basket: 'Cart',
    cart: 'Cart',
    favorites: 'Favorites',
    profile: 'Profile',
    addresses: 'Addresses',
    orders: 'Orders',
    settings: 'Settings',
      // Business Portal
    businessOrders: 'Business Orders',    businessMenu: 'Business Menu',
    businessSettings: 'Business Settings',
    orderHistory: 'Order History',
    
    // Business Settings
    businessSettingsTitle: 'BUSINESS SETTINGS',
    businessName: 'Business Name',
    businessHours: 'Business Hours',
    openingTime: 'Opening Time',
    closingTime: 'Closing Time',
    businessImage: 'Business Image',
    uploadImage: 'Upload Image',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    saveSettings: 'SAVE',    businessImageUpdated: 'Business image updated successfully',    imageUploadError: 'An error occurred while uploading the image',
    settingsLoadError: 'Business settings could not be loaded. Please try again later.',
    businessSettingsUpdated: 'Business settings updated successfully',
    changePasswordButton: 'CHANGE PASSWORD',
    deleteAccountConfirm: 'Are you sure you want to delete your account? This action cannot be undone.',
    yesDelete: 'Yes, Delete',
    
    // Settings
    notifications: 'Notifications',
    language: 'Language',
    theme: 'Theme',
    allowPushNotifications: 'Allow push notifications',
    allowPullNotifications: 'Allow pull notifications',
    allowPromotionNotifications: 'Allow promotion notifications',
    useDeviceTheme: 'Use device theme',
    original: 'Original',
    dark: 'Dark',
    turkish: 'Turkish',
    english: 'English',
    
    // Restaurants Page
    restaurantsNotLoaded: 'Restaurants could not be loaded.',
    searchRestaurant: 'Search for a restaurant',
    closedNow: 'Closed now',
    phone: 'Phone',
    email: 'Email',
    noResultsFound: 'No results found.',
      // Menu Page
    filter: 'Filter',
    sort: 'Sort',
    category: 'Category',
    all: 'All',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    applyFilters: 'Apply Filters',
    resetFilters: 'Reset Filters',    addToBasket: 'Add to Cart',
    addToCart: 'Add to Cart',
    removeFromBasket: 'Remove from Cart',
    removeFromCart: 'Remove from Cart',
    addedToBasket: 'Added to cart',
    addedToCart: 'Added to cart',
    removedFromBasket: 'Removed from cart',
    removedFromCart: 'Removed from cart',
    addedToFavorites: 'Added to favorites',
    removedFromFavorites: 'Removed from favorites',
    restaurantClosed: 'Restaurant is currently closed',
    restaurantClosedCannotOrder: 'You cannot place an order because the restaurant is currently closed.',
    noMenuItems: 'No menu items found for this restaurant.',
    sortByNameAsc: 'Name (A-Z)',
    sortByNameDesc: 'Name (Z-A)',
    sortByPriceAsc: 'Price (Low-High)',
    sortByPriceDesc: 'Price (High-Low)',
      // Profile Page
    editProfile: 'Edit Profile',
    accountDetails: 'Account Details',
    name: 'Name',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    changing: 'Changing...',
    deleteAccount: 'Delete Account',
    deleteAccountTitle: 'Delete Account',
    deleteAccountWarning: 'Are you sure you want to delete your account? This action cannot be undone.',
    confirmDelete: 'Yes, Delete',
    profileUpdated: 'Profile updated successfully',
    passwordUpdated: 'Password changed successfully.',
    accountDeleted: 'Your account has been deleted. Logging out...',
    goBack: 'Go Back',
    userInfoNotLoaded: 'User information could not be loaded.',
    updateFailed: 'Update failed.',
    passwordChangeFailed: 'Password could not be changed.',
    deleteAccountFailed: 'Account could not be deleted.',    // Common
    loading: 'Loading...',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    search: 'Search',
    home: 'Home',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    range: 'Range',
    min: 'Min',
    max: 'Max',
    apply: 'Apply',
    reset: 'Reset',    // Header & Navigation
    myBasket: 'My Cart',
    myCart: 'My Cart',
    emptyBasket: 'Your cart is empty',
    emptyCart: 'Your cart is empty',
    goToBasket: 'GO TO CART',
    goToCart: 'GO TO CART',
    guestUser: 'Guest User',
    pleaseLogin: 'Please login',
    accountDetails: 'Account Details',
    myAddresses: 'My Addresses',
    orderHistory: 'Order History',
    logOut: 'Log Out',
    
    // Cart/Basket Page
    cartTitle: 'My Cart',
    emptyCartMessage: 'Your cart is empty',
    emptyCartSubtext: 'Add items from the menu to complete your order',
    backToMenu: 'Back to Menu',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    totalAmount: 'Total Amount',
    deliveryAddress: 'Delivery Address',
    selectAddress: 'Select Address',
    addNewAddress: 'Add New Address',
    orderNote: 'Order Note',
    orderNotePlaceholder: 'If you have any special requests for your order, you can write them here...',
    completeOrder: 'Complete Order',
    orderSuccess: 'Order Successful',
    orderSuccessMessage: 'Your order has been successfully placed!',
    
    // Orders Page
    orders: {
      title: 'My Order History',
      noOrders: 'You have no order history yet.',
      loadError: 'An error occurred while loading order history.',
      addedToCart: 'All items added to cart!',
      unknownBusiness: 'Unknown Business',
      pieces: 'pcs',
      note: 'Note',
      total: 'Total',
      addAllToCart: 'Add All to Cart'
    },
    
    // Addresses Page
    addresses: {
      title: 'My Addresses',
      noAddresses: 'No addresses added yet. Add a new address.',
      loadError: 'Could not load addresses. Please try again later.',
      addNew: 'Add New Address',
      edit: 'Edit Address',
      addSuccess: 'Address added successfully.',
      addError: 'An error occurred while adding address.',
      updateSuccess: 'Address updated successfully.',
      updateError: 'An error occurred while updating address.',
      deleteConfirm: 'Are you sure you want to delete this address?',
      deleteSuccess: 'Address deleted successfully.',
      deleteError: 'An error occurred while deleting address.'
    },
    
    // Business Orders Page
    businessOrders: {
      title: 'ORDERS',
      loadError: 'Failed to load orders.',
      ordersConfirmed: 'Orders confirmed.',
      ordersNotConfirmed: 'Failed to confirm orders.',
      orderRejected: 'Order rejected.',
      orderNotRejected: 'Failed to reject order.',
      ordersDelivered: 'Orders marked as delivered.',
      ordersNotDelivered: 'Failed to mark orders as delivered.',
      customer: 'Customer',
      note: 'Note',
      total: 'Total',
      confirm: 'CONFIRM',
      reject: 'REJECT',
      rejectConfirm: 'Reject Order',
      rejectWarning: 'Are you sure you want to reject this order? This action cannot be undone.',
      yes: 'Yes',
      no: 'No',
      noIdleOrders: 'No pending orders.',
      noAwaitingDelivery: 'No orders awaiting delivery.',
      idleOrders: 'Pending Orders',
      awaitingDelivery: 'Awaiting Delivery',
      markAsDelivered: 'Mark as Delivered',
      soundNotifications: 'Sound Notifications',
      soundOn: 'On',
      soundOff: 'Off',
      soundTip: 'Toggle sound notifications for new orders',
      newOrderArrived: 'New order received! Pending orders: {count}',
      browserBlockedSound: 'Your browser is blocking automatic sound playback. Click anywhere on the page and try again.',
      enableSoundNotifications: 'Click to enable sound notifications',
      soundPermissionRequired: 'Sound Permission Required',
      soundPermissionMessage: 'Your browser requires interaction before playing sounds. Please click on the page to enable notifications.',
      testNotification: 'Test Notification',
      enableNotifications: 'Enable Notifications'
    },
      // Business Performance Page
    businessPerformance: {
      title: 'Performance Analytics',
      subtitle: 'Business Performance Dashboard',
      loadError: 'An error occurred while loading data',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      totalRevenue: 'Total Revenue',
      totalOrders: 'Total Orders',
      avgOrderValue: 'Avg. Order Value',
      salesTrends: 'Sales Trends',
      revenue: 'Revenue',
      orders: 'Orders',
      revenueChart: 'Revenue (₺)',
      ordersChart: 'Orders',
      noSalesData: 'No sales data available for the selected period',
      topProducts: 'Top Selling Products',
      bestSelling: 'Best Selling',
      highestRevenue: 'Highest Revenue',
      sales: 'Sales',
      noProductData: 'No product sales data available',
      favoritesAnalysis: 'Favorites Analysis',
      noFavoritesData: 'No favorites data available'
    },
    
    // Address Form Dialog
    addressForm: {
      nameLabel: 'Address Title',
      detailLabel: 'Address Details',
      cancel: 'Cancel',
      save: 'Save'
    },
    
    // Business Order History Page
    businessOrderHistory: {
      title: 'ORDER HISTORY',
      loadError: 'Failed to load order history.',
      delivered: 'Delivered',
      pending: 'Pending',
      noHistory: 'No order history.',
      note: 'Note',
      total: 'Total'
    },
    
    // Business Layout (Sidebar Menu)
    businessLayout: {
      orders: 'Orders',
      orderHistory: 'Order History',
      menu: 'Menu',
      performance: 'Performance',
      settings: 'Settings',
      exit: 'Exit',
      businessName: 'Business Name'
    },
      // Restaurant Status Widget
    restaurantStatus: {
      open: 'OPEN',
      closed: 'CLOSED',
      clickToClose: 'Click to close',
      clickToOpen: 'Click to open'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  const t = (key, params = {}) => {
    // Handle nested keys like 'businessPerformance.title'
    const keys = key.split('.');
    let translation = translations[language];
    
    // Navigate through nested object
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        translation = key; // Return original key if not found
        break;
      }
    }
    
    // If translation is still an object, return the key
    if (typeof translation === 'object') {
      translation = key;
    }
    
    // Replace parameters in translation (e.g., {time} -> actual time)
    if (typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    
    return translation;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

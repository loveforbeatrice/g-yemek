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
    welcome: 'HOŞGELDİNİZ',
    gülbahce: 'GÜLBAHÇE\'NİN 1 NUMARALI',
    foodPlatform: 'YEMEK SİPARİŞ PLATFORMUNA',
    signIn: 'GİRİŞ YAP',
    signUp: 'KAYIT OL',
    alreadyHaveAccount: 'Zaten Hesabınız Var Mı?',
    dontHaveAccount: 'Hesabınız Yok Mu?',
    areYouBusiness: 'İşletme misiniz?',
    businessPortal: 'İŞLETME PORTALI',
    userPortal: 'KULLANICI PORTALI',
    createAccount: 'HESAP OLUŞTUR',
    businessName: 'İşletme Adı',
    fullName: 'Ad Soyad',
    phoneNumber: 'Telefon Numarası',
    phoneNumberPlaceholder: 'Telefon Numarası (5XX XXX XX XX)',
    password: 'Şifre',
    confirmPassword: 'Şifre Tekrar',
    forgotPassword: 'Şifremi Unuttum?',
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
    addresses: 'Adresler',
    orders: 'Siparişler',
    settings: 'Ayarlar',
    
    // Business Portal
    businessOrders: 'İşletme Siparişleri',
    businessMenu: 'İşletme Menüsü',
    businessSettings: 'İşletme Ayarları',
    businessPerformance: 'İşletme Performansı',
    orderHistory: 'Sipariş Geçmişi',
    
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
    emptyCartSubtext: 'Siparişinizi tamamlamak için menüden ürün ekleyin',
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
    orderSuccessMessage: 'Siparişiniz başarıyla alındı!'
  },  en: {
    // Auth & Login
    welcome: 'WELCOME TO',
    gülbahce: 'GÜLBAHÇE\'S #1',
    foodPlatform: 'FOOD ORDERING PLATFORM',
    signIn: 'SIGN IN',
    signUp: 'SIGN UP',
    alreadyHaveAccount: 'Already Have An Account?',
    dontHaveAccount: 'If You Don\'t Have An Account',
    areYouBusiness: 'Are You A Business?',
    businessPortal: 'BUSINESS PORTAL',
    userPortal: 'USER PORTAL',
    createAccount: 'CREATE ACCOUNT',
    businessName: 'Business Name',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    phoneNumberPlaceholder: 'Phone Number (5XX XXX XX XX)',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot password?',
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
    businessOrders: 'Business Orders',
    businessMenu: 'Business Menu',
    businessSettings: 'Business Settings',
    businessPerformance: 'Business Performance',
    orderHistory: 'Order History',
    
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
    orderSuccessMessage: 'Your order has been successfully placed!'
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
    let translation = translations[language]?.[key] || key;
    
    // Replace parameters in translation (e.g., {time} -> actual time)
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
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

// FireBase

// For production
// exports.firebaseConfig = {
//     apiKey: "AIzaSyAzenKzzevWXmj_UCeMvoWGCH2GPKTw2dg",
//     authDomain: "ryan-915d2.firebaseapp.com",
//     databaseURL: "https://ryan-915d2.firebaseio.com",
//     projectId: "ryan-915d2",
//     storageBucket: "ryan-915d2.appspot.com",
//     messagingSenderId: "815445014237"
// };


// For Dev
exports.firebaseConfig = {
  apiKey: 'AIzaSyCKlUCfFKVRI0T-W7oJdufKD3HtE6KMg_w',
  authDomain: 'rentroom-dev.firebaseapp.com',
  databaseURL: 'https://rentroom-dev.firebaseio.com',
  projectId: 'rentroom-dev',
  storageBucket: 'rentroom-dev.appspot.com',
  messagingSenderId: '690658338227',
};

// App setup
exports.adminConfig = {
  appName: 'Rentroom',
  slogan: 'made with love for a great tennant experience.',
  design: {
    sidebarBg: 'sidebar-1.jpg', // sidebar-1, sidebar-2, sidebar-3
    dataActiveColor: 'blue', // "purple | blue | green | orange | red | rose"
    dataBackgroundColor: 'white', // "white | black"
  },
  showItemIDs: false,
  allowedUsers: null, // If null, allow all users, else it should be array of allowd users
  allowGoogleAuth: true, // Allowed users must contain list of allowed users in order to use google auth
  fieldBoxName: 'Fields',
  maxNumberOfTableHeaders: 9,
  prefixForJoin: [''],
  showSearchInTables: true,
  methodOfInsertingNewObjects: 'push', // timestamp (key+time) | push - use firebase keys
  goDirectlyInTheInsertedNode: true,
  urlSeparator: '+',
  urlSeparatorFirestoreSubArray: '~',
  googleMapsAPIKey: 'YOUR_KEY',

  fieldsTypes: {
    photo: ['photo', 'image'],
    dateTime: ['end', 'start'],
    map: ['map', 'latlng', 'location'],
    textarea: ['description', 'name'],
    html: ['content'],
    radio: ['radio', 'radiotf', 'featured'],
    checkbox: ['checkbox'],
    dropdowns: ['status', 'dropdowns', 'Property'],
    file: ['video'],
    rgbaColor: ['rgba'],
    hexColor: ['color'],
    relation: ['type', 'creator'],
    iconmd: ['icon'],
    iconfa: ['iconfa'],
    iconti: ['iconti'],
    iconio: ['iconio'],
  },
  optionsForDateTime: [
    {
      key: 'lease start',
      dateFormat: 'MMM dd, YYYY',
      timeFormat: false,
      saveAs: 'x',
      locale: 'es',
    },
    { key: 'end', dateFormat: 'YYYY-MM-DD', timeFormat: true, saveAs: 'x', locale: 'es' },
    { key: 'start', dateFormat: 'X', timeFormat: 'HH:mm', saveAs: 'x' },
  ],
  optionsForSelect: [
    { key: 'dropdowns', options: ['', 'new', 'processing', 'rejected', 'completed'] },
    { key: 'Property', options: [] },
    { key: 'checkbox', options: ['Skopje', 'Belgrade', 'New York'] },
    { key: 'status', options: ['just_created', 'confirmed', 'canceled'] },
    { key: 'radio', options: ['no', 'maybe', 'yes'] },
    { key: 'radiotf', options: ['true', 'false'] },
    { key: 'featured', options: ['true', 'false'] },
  ],
  optionsForRelation: [
    {
      // Firestore - Native
      display: 'name',
      isValuePath: true,
      key: 'creator',
      path: 'users',
      produceRelationKey: false,
      relationJoiner: '-',
      relationKey: 'type_eventid',
      value: 'name',
    },
    {
      // Firebase - Mimic function
      display: 'name',
      key: 'eventtype',
      path: '',
      isValuePath: false,
      value: 'name',
      produceRelationKey: true,
      relationJoiner: '-',
      relationKey: 'type_eventid',
    },
  ],
  paging: {
    pageSize: 10,
    finite: true,
    retainLastPage: false,
  },
  hiddenKeys: ['keyToHide', 'anotherKeyToHide', 'email'],
  previewOnlyKeys: ['previewOnlyKey', 'anotherPreviewOnlyKye', 'name'],
};

// Navigation
exports.navigation = [
  {
    link: '/',
    name: 'Dashboard',
    schema: null,
    icon: 'dashboard',
    path: '',
    isIndex: true,
  },
  {
    link: 'fireadmin',
    path: 'property_groups/amicus_properties/locations',
    name: 'Properties',
    icon: 'home',
    tableFields: ['uidOfFirebase'],
    // "tableFields":["image", "Address","City","State"],
  },
  {
    link: 'fireadmin',
    path: 'property_groups/amicus_properties/users',
    name: 'Residents',
    icon: 'people',
    tableFields: ['name', 'email', 'monthlyRent', 'price'],
  },
  {
    link: 'fireadmin',
    path: 'property_groups/amicus_properties/maintenance_requests',
    name: 'Maintenance Requests',
    icon: 'domain',
    tableFields: ['photo', 'tenant', 'tenant_email', 'subject', 'message'],
  },
  {
    link: 'fireadmin',
    path: 'property_groups/amicus_properties/posts',
    name: 'Community Posts',
    icon: 'chat',
    tableFields: ['name', 'text', 'city'],
  },
  {
    link: 'fireadmin',
    path: 'property_groups/amicus_properties/Metrics',
    name: 'Edit Metrics',
    icon: 'edit',
    tableFields: [],
  },
  {
    link: 'fireadmin',
    path: 'Stripe Connect',
    name: 'Payments Setup',
    icon: 'autorenew',
    tableFields: [],
  },
  {
    link: 'link',
    path: 'https://ryan-915d2.firebaseapp.com',
    name: 'Help',
    icon: 'help',
    tableFields: ['name'],
  },
];

// From v 5.1.0 we suggest remoteSetup due to security
//
exports.pushSettings = {
  remoteSetup: false,
  remotePath: 'pushSettings',
  pushType: 'expo', // firebase -  onesignal - expo
  Firebase_AuthorizationPushKey: 'AIzaSyCFUf7fspu61J9YsWE-2A-vI9of1ihtSiE', // Firebase push authorization ket
  pushTopic: 'news', // Only for firebase push
  oneSignal_REST_API_KEY: '',
  oneSignal_APP_KEY: '',
  included_segments: 'Active Users', // Only for onesignal push
  firebasePathToTokens: '/expoPushTokens', // we save expo push tokens in firebase db
  saveNotificationInFireStore: true, // Should we store the notification in firestore
};

exports.userDetails = {};

exports.remoteSetup = false;
exports.remotePath = 'admins/mobidonia';
exports.allowSubDomainControl = false;
exports.subDomainControlHolder = 'admins/';

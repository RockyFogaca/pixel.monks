function APIMM(eventObjectLocal) {
    fetch("https://gtm-cloud-image-mq5jeuyd7a-uc.a.run.app/pixel", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventObjectLocal)
    })
        .catch(function (erro) {
            console.error(erro);
        });
}

function pm(eventObject) {
    function geraIDUnico() {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        var randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
        var timestamp = new Date().toISOString();
        var parteAleatoria = Math.random().toString(36).substr(2, 5);
        var idUnico = randomLetter + '-' + timestamp + parteAleatoria;
        return idUnico;
    }

    function geraIDSessao() {
        var sessionId = 'SE-' + geraIDUnico();
        sessionStorage.setItem('MMPsessionId', sessionId);
        return sessionId;
    }

    function geraPointer() {
        var hash = geraIDUnico();
        var Tpointer = 'P-' + hash + '-' + Date.now();
        sessionStorage.setItem('MMhash', hash);
        return Tpointer;
    }

    function geraDeviceId() {
        var deviceId = 'DE/' + geraIDUnico() + Date.now().toString(36) + '/' + ResgataSystem();
        localStorage.setItem('MMdevice', deviceId);
        return deviceId;
    }

    function ResgataSystem() {
        var userAgent = navigator.userAgent;
        var operatingSystem = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i);
        var system = operatingSystem ? operatingSystem[0] : 'desconhecido';
        return system;
    }

    function ResgataSessao() {
        return sessionStorage.getItem('MMPsessionId');
    }

    function ResgataDeviceId() {
        return localStorage.getItem('MMdevice');
    }

    function ResgataPointer() {
        var hash = sessionStorage.getItem('MMhash');
        var Tpointer = 'P-' + hash + '-' + Date.now();
        return Tpointer;
    }

    function Iniciar(eventObject) {
        //Funções usadas para gerenciar as informações de promoções internas
        const BANNER_DATA_MANAGER = bannerDataManager();

        var eventObjectLocal = {
            timestamp: new Date().toISOString(),
            session_id: ResgataSessao(),
            system: ResgataSystem(),
            url: document.URL,
            ref: document.referrer,
            pointer: ResgataPointer(),
            client_id: eventObject.client_id,
            custom_element: JSON.stringify(eventObject.customElement) || '{}'
        };

        switch (eventObject.type) {
            case "gen":
                eventObjectLocal.type = 'gen';
                eventObjectLocal.p1 = eventObject.p1;
                eventObjectLocal.p2 = eventObject.p2;
                eventObjectLocal.p3 = eventObject.p3;
                eventObjectLocal.p4 = eventObject.p4;
                eventObjectLocal.p5 = eventObject.p5;
                eventObjectLocal.p_value = eventObject.p_value;
                APIMM(eventObjectLocal);

                break;
            
            case "form":
                eventObjectLocal.type = 'form';
                eventObjectLocal.p1 = eventObject.p1;
                eventObjectLocal.p2 = eventObject.p2;
                eventObjectLocal.p_value = eventObject.p_value;
                APIMM(eventObjectLocal);

                break;

            case 'click_product_list':
                eventObjectLocal.type = 'click_product_list';
                eventObjectLocal.items = eventObject.items;
                eventObjectLocal.list = eventObject.list;
                eventObjectLocal.index = eventObject.index;
                APIMM(eventObjectLocal);

                break;

            case 'view_product_list':
                eventObjectLocal.type = 'view_product_list';
                eventObjectLocal.items = eventObject.items;
                eventObjectLocal.list = eventObject.list;
                eventObjectLocal.index = eventObject.index;
                APIMM(eventObjectLocal);

                break;

            case 'purchase':
                eventObjectLocal.type = 'purchase';
                eventObjectLocal.items = eventObject.items;
                eventObjectLocal.total = eventObject.total;
                eventObjectLocal.transaction_id = eventObject.transaction_id;
                console.log(eventObjectLocal);
                APIMM(eventObjectLocal);

                break;

            case 'checkout':
                eventObjectLocal.type = 'checkout';
                eventObjectLocal.items = eventObject.items;
                eventObjectLocal.total = eventObject.total;
                APIMM(eventObjectLocal);

                break;

            case 'remove_product':
                eventObjectLocal.type = 'remove_product';
                eventObjectLocal.items = eventObject.items;
                APIMM(eventObjectLocal);

                break;

            case 'add_product':
                eventObjectLocal.type = 'add_product';
                eventObjectLocal.items = eventObject.items;
                APIMM(eventObjectLocal);

                break;

            case 'view_product':
                eventObjectLocal.type = 'view_product';
                eventObjectLocal.items = eventObject.items;

                BANNER_DATA_MANAGER.saveViewedItem(eventObject.items, eventObjectLocal.url);

                APIMM(eventObjectLocal);

                break;
                
            case 'view_banner':
                //TODO
                APIMM(eventObjectLocal);

                break;

            case 'click_banner':
                eventObjectLocal.type = 'click_banner';
                eventObjectLocal.list = eventObject.bannerData.promotion_name;
                eventObjectLocal.index = eventObject.bannerData.creative_slot;
                eventObjectLocal.creative = eventObject.bannerData.creative_name;
                eventObjectLocal.customElement = JSON.stringify(eventObject.bannerData);

                BANNER_DATA_MANAGER.saveSelectedBanner(eventObject.bannerData);

                APIMM(eventObjectLocal);

                break;

            case 'page_view':
                var sessionId = ResgataSessao();
                if (!sessionId) {
                    sessionId = geraIDSessao();
                    var pointer = geraPointer();
                    eventObjectLocal.type = "session_start";
                    eventObjectLocal.session_id = sessionId;
                    eventObjectLocal.pointer = pointer;
                    APIMM(eventObjectLocal);
                }
                eventObjectLocal.type = "page_view";
                APIMM(eventObjectLocal);

                break;
        }
    }

    Iniciar(eventObject);
}

function bannerDataManager() {
    var saveSelectedBanner = function saveSelectedBanner(promoClick) {
        var keyLS, libLS, expiryTimestamp;
        var promoObj, promoList, promoHref;
        
        
        keyLS = promoClick.keyLS || 'MM_promotions';
        libLS = libLocalStorage();
        expiryTimestamp = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias em milissegundos
        
        promoObj = JSON.parse( libLS.getItem(keyLS) || '{}' );
        //promoList = promoObj.promos || {};
        promoURL = promoClick.promotion_url;
        promoObj[promoURL] = promoObj[promoURL] || {};
        
        promoClick['expiry'] = expiryTimestamp;
        promoObj[promoURL].bannerData = promoClick;
        //promoList[promoURL].bannerData = promoClick;
        //promoObj['promos'] = promoList;
        
        promoObj = JSON.stringify(promoObj);
        libLS.setItem(keyLS, promoObj);
    }

    var saveViewedItem = function saveViewedItem(itemData, pageUrl){
        var keyLS, libLS;
        var promoObj, promoList, itemsList;
        
        keyLS = 'MM_promotions';
        libLS = libLocalStorage();
        
        promoObj = JSON.parse( libLS.getItem(keyLS) || '{}' );
        //promoList = promoObj.promos || {};
        itemsList = promoObj[pageUrl].items || {};
        
        if (pageUrl in promoObj == true && itemData.product_id in itemsList == false) {
            itemsList[itemData.product_id] = itemData;
            promoObj[pageUrl].items = itemsList;
            
            promoObj = JSON.stringify(promoObj);
            libLS.setItem(keyLS, promoObj);
        }
    }

    var bannerDataManaer = {
        saveSelectedBanner: saveSelectedBanner,
        saveViewedItem: saveViewedItem
    };
    
    return bannerDataManaer;
}

function libLocalStorage() {
  
    var getItem = function getItem(key) {
      return hasItem(key) ? localStorage.getItem(key) : undefined;
    };
    
    
    var setItem = function setItem(key, value) {
      localStorage.setItem(key, value);
      return hasItem(key);
    };
    
    
    var removeItem = function removeItem(key) {
      localStorage.removeItem(key);
      return !hasItem(key);
    };
    
    
    var hasItem = function hasItem(key) {
      return localStorage.getItem(key) !== null;
    };
    
    
    var keys = function keys() {
      var allKeys = [];
      for (var i = 0; i < localStorage.length; i++) {
        allKeys.push(localStorage.key(i))
      }
      if (allKeys.length == 0) {
        return null;
      }
      return allKeys;
    };
    
    
    var hasLocalStorageEnabled = function hasLocalStorageEnabled() {
      return typeof localStorage !== 'undefined';
    };
    
    
    var removeAll = function removeAll() {
      var allKeys = keys();
      if (allKeys) {
        allKeys.forEach(function(key) {
          removeItem(key);
        });
      }
      return !keys() ? true : false;
    };
    
    
    var libLocalStorage = {
      getItem: getItem,
      setItem: setItem,
      removeItem: removeItem,
      hasItem: hasItem,
      keys: keys,
      hasLocalStorageEnabled: hasLocalStorageEnabled,
      removeAll: removeAll
    };
    
    return libLocalStorage;
}
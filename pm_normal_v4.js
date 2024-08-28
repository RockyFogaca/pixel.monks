function APIMM(eventObjectLocal) {
  fetch("https://gtm-cloud-image-mq5jeuyd7a-uc.a.run.app/pixel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventObjectLocal),
  }).catch(function (erro) {
    console.error(erro);
  });
}

function pm(eventObject) {
  function geraIDUnico() {
    var letters = "abcdefghijklmnopqrstuvwxyz";
    var randomLetter = letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
    var timestamp = new Date().toISOString();
    var parteAleatoria = Math.random().toString(36).substr(2, 5);
    var idUnico = randomLetter + "-" + timestamp + parteAleatoria;
    return idUnico;
  }

  function geraIDSessao() {
    var sessionId = "SE-" + geraIDUnico();
    sessionStorage.setItem("MMPsessionId", sessionId);
    return sessionId;
  }

  function geraPointer() {
    var hash = geraIDUnico();
    var Tpointer = "P-" + hash + "-" + Date.now();
    sessionStorage.setItem("MMhash", hash);
    return Tpointer;
  }

  function geraDeviceId() {
    var deviceId =
      "DE/" + geraIDUnico() + Date.now().toString(36) + "/" + ResgataSystem();
    localStorage.setItem("MMdevice", deviceId);
    return deviceId;
  }

  function ResgataSystem() {
    var userAgent = navigator.userAgent;
    var operatingSystem = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i);
    var system = operatingSystem ? operatingSystem[0] : "desconhecido";
    return system;
  }

  function ResgataSessao() {
    return sessionStorage.getItem("MMPsessionId");
  }

  function ResgataDeviceId() {
    return localStorage.getItem("MMdevice");
  }

  function ResgataPointer() {
    var hash = sessionStorage.getItem("MMhash");
    var Tpointer = "P-" + hash + "-" + Date.now();
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
      custom_element: JSON.stringify(eventObject.customElement) || "{}",
    };

    switch (eventObject.type) {
      case "gen":
        eventObjectLocal.type = "gen";
        eventObjectLocal.p1 = eventObject.p1;
        eventObjectLocal.p2 = eventObject.p2;
        eventObjectLocal.p3 = eventObject.p3;
        eventObjectLocal.p4 = eventObject.p4;
        eventObjectLocal.p5 = eventObject.p5;
        eventObjectLocal.p_value = eventObject.p_value;
        APIMM(eventObjectLocal);

        break;

      case "form":
        eventObjectLocal.type = "form";
        eventObjectLocal.p1 = eventObject.p1;
        eventObjectLocal.p2 = eventObject.p2;
        eventObjectLocal.p_value = eventObject.p_value;
        APIMM(eventObjectLocal);

        break;

      case "click_product_list":
        eventObjectLocal.type = "click_product_list";
        eventObjectLocal.list = eventObject.list;
        eventObjectLocal.index = eventObject.index;
        eventObjectLocal.items = BANNER_DATA_MANAGER.assignBannersToItems(
          eventObject.items
        );

        APIMM(eventObjectLocal);

        break;

      case "view_product_list":
        eventObjectLocal.type = "view_product_list";
        eventObjectLocal.list = eventObject.list;
        eventObjectLocal.index = eventObject.index;

        BANNER_DATA_MANAGER.saveViewedItem(
          eventObject.items,
          eventObjectLocal.url
        );
        eventObjectLocal.items = BANNER_DATA_MANAGER.assignBannersToItems(
          eventObject.items
        );

        APIMM(eventObjectLocal);

        break;

      case "purchase":
        eventObjectLocal.type = "purchase";
        eventObjectLocal.total = eventObject.total;
        eventObjectLocal.transaction_id = eventObject.transaction_id;

        eventObjectLocal.items = BANNER_DATA_MANAGER.assignBannersToItems(
          eventObject.items
        );

        APIMM(eventObjectLocal);

        break;

      case "checkout":
        eventObjectLocal.type = "checkout";
        eventObjectLocal.total = eventObject.total;
        eventObjectLocal.items = BANNER_DATA_MANAGER.assignBannersToItems(
          eventObject.items
        );
        APIMM(eventObjectLocal);

        break;

      case "remove_product":
        eventObjectLocal.type = "remove_product";
        eventObjectLocal.items = eventObject.items;
        APIMM(eventObjectLocal);

        break;

      case "add_product":
        eventObjectLocal.type = "add_product";
        eventObjectLocal.items = BANNER_DATA_MANAGER.assignBannersToItems(
          eventObject.items
        );
        APIMM(eventObjectLocal);

        break;

      case "view_product":
        eventObjectLocal.type = "view_product";

        BANNER_DATA_MANAGER.saveViewedItem(
          eventObject.items,
          eventObjectLocal.url
        );
        eventObjectLocal.items = BANNER_DATA_MANAGER.assignBannersToItems(
          eventObject.items
        );

        APIMM(eventObjectLocal);

        break;

      case "view_banner":
        eventObjectLocal.type = "view_banner";
        //No banco de dados, as informações de banners são guardadas como atributos de itens
        eventObjectLocal.items = [{
          product_name: eventObject.bannerData.creative_name,
          product_price: 0,
          banners: [eventObject.bannerData]
        }];

        APIMM(eventObjectLocal);

        break;

      case "click_banner":
        eventObjectLocal.type = "click_banner";
        //No banco de dados, as informações de banners são guardadas como atributos de itens
        eventObjectLocal.items = [{
          product_name: eventObject.bannerData.creative_name,
          product_price: 0,
          banners: [eventObject.bannerData]
        }];

        BANNER_DATA_MANAGER.saveSelectedBanner(eventObject.bannerData);

        APIMM(eventObjectLocal);

        break;

      case "page_view":
        var sessionId = ResgataSessao();

        //Inícia uma sessão
        if (!sessionId) {
          sessionId = geraIDSessao();
          var pointer = geraPointer();
          eventObjectLocal.type = "session_start";
          eventObjectLocal.session_id = sessionId;
          eventObjectLocal.pointer = pointer;

          BANNER_DATA_MANAGER.cleanData();

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
  var libLS = libLocalStorage();
  var keyLS = "MM_promotions";

  var saveSelectedBanner = function saveSelectedBanner(promoClick) {
    var expiryTimestamp, promoObj;

    expiryTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

    promoObj = libLS.getItem(keyLS) || {};
    promoURL = promoClick.promotion_url;
    promoObj[promoURL] = promoObj[promoURL] || {};

    promoClick["expiry"] = expiryTimestamp;
    promoObj[promoURL].bannerData = promoClick;

    libLS.setItem(keyLS, promoObj);
  };

  var saveViewedItem = function saveViewedItem(itemsArr, pageUrl) {
    var promoObj, itemsList;

    promoObj = libLS.getItem(keyLS) || {};
    itemsList =
      promoObj[pageUrl] && promoObj[pageUrl].items
        ? promoObj[pageUrl].items
        : {};

    if (pageUrl in promoObj) {
      for (var i in itemsArr) {
        if (itemsArr[i].product_id in itemsList == false) {
          itemsList[itemsArr[i].product_id] = itemsArr[i];
        }
      }

      promoObj[pageUrl].items = itemsList;
      //promoObj[pageUrl].bannerData.banner_items = JSON.stringify(itemsList);

      libLS.setItem(keyLS, promoObj);
    }
  };

  function deleteAssignedBanners(assignedBanners) {
    var promoObj = libLS.getItem(keyLS) || {};

    //Apaga as informações dos banners que estiverem relacionados com algum item comprado
    for (var i in assignedBanners) {
      var bannerUrl = assignedBanners[i];
      if (bannerUrl in promoObj) {
        delete promoObj[bannerUrl];
      }
    }

    libLS.setItem(keyLS, promoObj);
  }

  var assignBannersToItems = function assignBannersToItems(
    items,
    { deleteBannersData = false } = {}
  ) {
    //Array usado para salvar os banners que estão atribuídos a pelo menos um produto
    const assignedBanners = [];
    var promoObj = libLS.getItem(keyLS) || {};

    for (let i in items) {
      items[i].banners = items[i].banners || [];
      for (var j in promoObj) {
        promoObj[j].items = promoObj[j].items || {}; 
        //promoObj[j].items = promoObj[j].items ? promoObj[j].items : {}; 

        if (items[i].product_id in promoObj[j].items) {
          items[i].banners.push(promoObj[j].bannerData);

          //Inclui a chave do banner (URL) no array auxiliar caso ela não esteja presente
          if (assignedBanners.indexOf(j) < 0) {
            assignedBanners.push(j);
          }
        }
      }
    }

    //Caso o método tenha sido chamado para deletar as atribuições do localStorage
    if (deleteBannersData) {
      deleteAssignedBanners(assignedBanners);
    }

    return items;
  };

  var cleanData = function cleanData() {
    var promoObj, currentTimeStamp;

    promoObj = libLS.getItem(keyLS) || {};
    currentTimeStamp = Date.now();

    for (i in promoObj) {
      if (currentTimeStamp > promoObj[i].bannerData.expiry) {
        delete promoObj[i];
      }
    }

    libLS.setItem(keyLS, promoObj);
  };

  var bannerDataManaer = {
    saveSelectedBanner: saveSelectedBanner,
    saveViewedItem: saveViewedItem,
    cleanData: cleanData,
    assignBannersToItems: assignBannersToItems,
  };

  return bannerDataManaer;
}

function libLocalStorage() {
  var getItem = function getItem(key) {
    return hasItem(key) ? JSON.parse(localStorage.getItem(key)) : undefined;
  };

  var setItem = function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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
      allKeys.push(localStorage.key(i));
    }
    if (allKeys.length == 0) {
      return null;
    }
    return allKeys;
  };

  var hasLocalStorageEnabled = function hasLocalStorageEnabled() {
    return typeof localStorage !== "undefined";
  };

  var removeAll = function removeAll() {
    var allKeys = keys();
    if (allKeys) {
      allKeys.forEach(function (key) {
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
    removeAll: removeAll,
  };

  return libLocalStorage;
}

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
        var eventObjectLocal = {
            timestamp: new Date().toISOString(),
            session_id: ResgataSessao(),
            system: ResgataSystem(),
            url: document.URL,
            ref: document.referrer,
            pointer: ResgataPointer(),
            client_id: eventObject.client_id
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

            case 'add_product_list':
                eventObjectLocal.type = 'add_product_list';
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
                APIMM(eventObjectLocal);
                break;

            case 'page_view':
                let sessionId = ResgataSessao();
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
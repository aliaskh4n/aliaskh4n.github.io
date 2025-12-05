import { DOM } from './DOM.js';
import { Requester } from './Requester.js';
import { Cache } from './Cache.js';
import { initData } from '../test/tgdata.js';

const app = {
    state: {
        user: null,
        token: null,
        lottie_load: false,
        tg: {}
    },
    dom: {
        avatar:         DOM.get_element('profile-main avatar'),
        username:       DOM.get_element('profile-main username'),
        balance:        DOM.get_element('profile-main balance'),
        packTitle:      DOM.get_element('packs-main packs-name'),
        packs:          DOM.get_element('packs-main packs'),
    }
};

if(typeof initData !== 'undefined') {
    app.state.tg.initData = initData;
    app.state.tg.ready = () => {};
    app.state.tg.expand = () => {};
    app.state.tg.BackButton = { onClick: () => {}, show: () => {} };
} else {
    app.state.tg = window.Telegram.WebApp;
}

const requester = new Requester(app);


app.state.tg.ready();
app.state.tg.expand();

app.state.tg.BackButton.show();
app.state.tg.BackButton.onClick(() => {
    app.state.tg.BackButton.hide();
    window.history.back();
});

const set_avatar_text = () => {
    DOM.render(
        app.dom.avatar,
        app.state.user.name?.charAt(0).toUpperCase() || '👤'
    );
}

const update_ui = () => {
    app.dom.balance.textContent = app.state.user.balance.toLocaleString();
    app.dom.username.textContent = app.state.user.name.toLocaleString();

    app.dom.balance.removeAttribute('shimmer');
    app.dom.username.removeAttribute('shimmer');

    const avatar = app.dom.avatar;

    if (app.state.user.photoUrl) {
        const img = document.createElement('img');
        img.src = app.state.user.photoUrl;
        img.onerror = set_avatar_text;

        avatar.innerHTML = '';
        avatar.appendChild(img);
    } else set_avatar_text();
}

const set_packs = async () => {
    const packs = await requester.get_packs();
    app.dom.packTitle.removeAttribute('shimmer');
    DOM.render(app.dom.packs, '');

    packs.forEach(pack => {
        DOM.add(app.dom.packs, 
            `<pack id="${pack.id}" label="${pack.label}">
                <img src="${pack.photo_url}">
                <pack-title>
                    <count>${pack.coins}</count>
                    <cost>${pack.stars} <star></star></cost>
                </pack-title>
            </pack>`
        );
    });

    DOM.get_elements('pack').forEach((element) => {
        element.onclick = async () => {
            const pack_id = element.getAttribute('id');
            const label = element.getAttribute('label');
            const invoice = await requester.create_invoice(app.state.user.id, pack_id);            
            const invoice_query = query_serialize({ label, ...invoice });
            
            location.href = location.origin + '/game/invoice/?' + invoice_query;
        }
    });
}

const query_serialize = (obj, prefix) => {
    var str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                query_serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

(async () => {
    const res = await requester.init(app.state.tg.initData);

    if(res !== null) {
        app.state.user = res.user;
        app.state.token = res.token;

        Cache.set_raw('user', res.user);
        Cache.set_raw('token', res.token);
    } else {
        const user = Cache.get_raw('user') ?? {};
        const token = Cache.get_raw('token') ?? {};

        app.state.user = user;
        app.state.token = token;
    }

    update_ui();
    set_packs();
})();

import { DOM } from './DOM.js';
import { Requester } from './Requester.js';
import { Cache } from './Cache.js';
// import { initData } from '../test/tgdata.js';

const app = {
    state: {
        user: null,
        token: null,
        lottie_load: false,
        tg: {}
    },
    dom: {
        packName:       DOM.get_element('pack-name'),
        mainContent:    DOM.get_element('main-content'),
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

const update_ui = () => {
    let params = new URL(document.location.toString()).searchParams;
    app.state.params = params;

    DOM.render(app.dom.mainContent, JSON.stringify(Object.fromEntries(params)));

    app.dom.packName.textContent = params.get('label') ?? "Null";
    app.dom.packName.removeAttribute('shimmer');
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
})();
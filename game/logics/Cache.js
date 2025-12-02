export class Cache {
    static version_str_name = btoa('version');

    static get_version(id) {
        const data_raw = JSON.parse(localStorage.getItem(id));
        return data_raw ? data_raw[this.version_str_name] : 0;
    }

    static set(id, version, data) {
        const data_version = this.get_version(id);

        console.log(data_version);
        
        
        if(data_version === version) {
            return false;
        }

        localStorage.setItem(id, JSON.stringify({ [this.version_str_name]: version, ...data }));
        return true;
    }

    static get(id) {
        const raw_data = localStorage.getItem(id);
        let data = JSON.parse(raw_data);
        delete data[this.version_str_name];

        return data ?? {};
    }

    static set_raw(id, data) {
        localStorage.setItem(id, JSON.stringify(data));
    }

    static get_raw(id) {
        const data = localStorage.getItem(id);
        return data ? JSON.parse(data) : null;
    }
}
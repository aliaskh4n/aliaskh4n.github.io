export class DOM {
    static document_get_id(element_query) {
        return document.getElementById(element_query);
    }

    static get_element(element_query) {
        return document.querySelector(element_query);
    }

    static render(element, html) {
        element.innerHTML = html;
    }

    static add(element, html) {
        element.innerHTML += html;
    }
}
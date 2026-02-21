import { toast } from "react-toastify";
import * as constants from "../utils/constants";
import GlobalValidations from "../utils/validations";
import * as apiEndpoints from "./apiEndPoints";
import axios from "axios";
// import { getAuth } from "../app/modules/auth"; 
import { store } from "../store/store";

class APICallService {
    public url: any;
    public apiType: any;
    public apiName: any;
    public params: any;
    public path: any;
    public listApi: any;
    public settings: any;
    public type: any;
    constructor(apiname: any, params?: any, path?: any, type?: any) {
        this.url = constants.BASE_URL;
        if (apiname.constructor === Array) {
            this.apiType = [];
            this.apiName = [];
            this.params = [];
            this.path = [];
            this.type = []
            apiname.forEach((item: any, index: number) => {
                var arr = item.toString().split(" ");
                this.apiType[index] = arr[1];
                this.apiName[index] = arr[0];
                this.params[index] = params[index];
                this.path[index] = path[index];
                this.type[index] = path[index]
            });
        } else {
            var arr = apiname.toString().split(" ");
            this.apiType = arr[1];
            this.apiName = arr[0];
            this.params = params;
            this.path = path;
            this.type = type;
        }
        // API endpoints that don't require Authentication
        this.listApi = [apiEndpoints.LOGIN, apiEndpoints.SIGNUP];
    }
    async findSettings(apiName: any, apiType: any, params: any, path: any, type?: any) {
        const resourceURL = `${this.url}${apiName}`;
        var myHeaders: any = {
            "ngrok-skip-browser-warning": "69420",
        };
        try {
            var mainAPIName = apiName + " " + apiType;
            // let token = getAuth();
            let token = store.getState().auth.token;
            if (!this.listApi.includes(mainAPIName)) {
                myHeaders = { ...myHeaders, Authorization: "Bearer " + token };
            }
        } catch (error) {
            console.log(error, "PREF_TOKEN error");
        }
        myHeaders = { ...myHeaders, platform: "web" };
        myHeaders = { ...myHeaders, appVersion: "1.0" };
        var settings: any = {
            redirect: "follow",
            url: resourceURL,
            headers: myHeaders,
            method: "",
            data: {},
            responseType: type,
            timeout: 3600000,
        };
        switch (apiType) {
            case constants.GET:
                settings.method = "GET";
                break;
            case constants.GET_ID_PARAMS:
                settings.method = "GET";
                settings.url = resourceURL + "/" + params;
                break;
            case constants.GET_URL_PARAMS:
                settings.method = "GET";
                settings.url = resourceURL + "?" + this.objToQueryString(params);
                if (params && params.pageNo) {
                    settings.url =
                        resourceURL +
                        "?" +
                        this.objToQueryString({
                            ...params,
                            skip:
                                parseInt(params.pageNo) * parseInt(params.limit) -
                                parseInt(params.limit) || 0,
                            limit: params.limit,
                            searchTerm: params.searchTerm ? params.searchTerm : "",
                        });
                }
                if (params && params.pageNo) {
                    delete params.pageNo;
                    delete params.limit;
                    settings.data = params;
                }
                break;
            case constants.GET_URL_ID_PARAMS:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                settings.headers = myHeaders;
                settings.method = "GET";
                if (params) {
                    settings.url =
                        resourceURL +
                        "/" +
                        this.objToUrlParams(path) +
                        "?" +
                        this.objToQueryString({
                            ...params,
                            skip:
                                parseInt(params.pageNo) * parseInt(params.limit) -
                                parseInt(params.limit) || 0,
                            limit: params.limit,
                            searchTerm: params.searchTerm ? params.searchTerm : "",
                        });
                }
                if (params && params.pageNo) {
                    delete params.pageNo;
                    delete params.limit;
                    settings.data = params;
                }
                break;
            case constants.GET_URL_ENCODED:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/x-www-form-urlencoded",
                };
                settings.headers = myHeaders;
                settings.method = "GET";
                settings.data = this.objToURLEncodedString(params);
                break;
            case constants.POST:
                settings.headers = myHeaders;
                settings.method = "POST";
                break;
            case constants.POST_ID_PARAMS:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                settings.headers = myHeaders;
                settings.method = "POST";
                settings.data = params;
                break;
            case constants.POST_RAW:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/json",
                };
                settings.headers = myHeaders;
                settings.method = "POST";
                settings.data = JSON.stringify(params);
                break;
            case constants.POST_FORM:
                settings.headers = myHeaders;
                settings.method = "POST";
                settings.data = params;
                break;
            case constants.MULTI_PART_ID_POST:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                settings.headers = myHeaders;
                settings.method = "POST";
                settings.data = params;
                break;
            case constants.POST_URL_PARAMS:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/json",
                };
                settings.method = "POST";
                if (params && params.pageNo) {
                    settings.url =
                        resourceURL +
                        "?" +
                        this.objToQueryString({
                            skip:
                                parseInt(params.pageNo) * parseInt(params.limit) -
                                parseInt(params.limit) || 0,
                            limit: params.limit,
                            searchTerm: params.searchTerm ? params.searchTerm : "",
                        });
                }
                if (params && params.pageNo) {
                    delete params.pageNo;
                    delete params.limit;
                    settings.data = params;
                }
                break;
            case constants.POST_URL_ENCODED:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    Accept: "application/json",
                };
                settings.headers = myHeaders;
                settings.method = "POST";
                settings.data = this.objToURLEncodedString(params);
                break;
            case constants.POST_URL_ENCODED_ID_PARAMS:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    Accept: "application/json",
                };
                settings.headers = myHeaders;
                settings.method = "POST";
                settings.data = this.objToURLEncodedString(params);
                break;
            case constants.PATCH:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/json",
                };
                settings.headers = myHeaders;
                settings.method = "PATCH";
                settings.data = JSON.stringify(params);
                break;
            case constants.PATCH_ID:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                myHeaders = {
                    ...myHeaders,
                    // 'Content-Type': 'application/json',
                };
                settings.headers = myHeaders;
                settings.method = "PATCH";
                settings.data = params;
                break;
            case constants.PATCH_FORM_ID:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                settings.headers = myHeaders;
                settings.method = "PATCH";
                settings.data = this.objToFormData(params);
                break;
            case constants.PATCH_FORM:
                settings.headers = myHeaders;
                settings.method = "PATCH";
                settings.data = this.objToFormData(params);
                break;
            case constants.PATCH_FORM_ID_URL_ENCODED:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                settings.headers = myHeaders;
                settings.method = "PATCH";
                settings.data = params;
                break;
            case constants.PATCH_URL_ENCODED:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    Accept: "application/json",
                };
                settings.headers = myHeaders;
                settings.method = "PATCH";
                settings.data = this.objToURLEncodedString(params);
                break;
            case constants.DELETE:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/json",
                };
                settings.headers = myHeaders;
                settings.method = "DELETE";
                settings.data = JSON.stringify(params);
                break;
            case constants.DELETE_ID_PARAMS:
                settings.method = "DELETE";
                settings.url = resourceURL + "/" + params;
                break;
            case constants.DELETE_ID_QUERY_PARAMS:
                settings.method = "DELETE";
                settings.url =
                    resourceURL +
                    "/" +
                    this.objToUrlParams(path) +
                    "?" +
                    this.objToQueryString(params);
                break;
            case constants.DELETE_URL_PARAMS:
                settings.method = "DELETE";
                settings.url = resourceURL + "?" + this.objToQueryString(params);
                break;
            case constants.DELETE_URL_ENCODED:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    Accept: "application/json",
                };
                settings.headers = myHeaders;
                settings.method = "DELETE";
                settings.data = this.objToURLEncodedString(params);
                break;
            case constants.MULTI_PART_POST:
                myHeaders = {
                    ...myHeaders,
                    "Content-Type": "multipart/form-data",
                    Accept: "*/*",
                };
                settings.headers = myHeaders;
                settings.method = "POST";
                settings.data = params;
                break;
            case constants.MULTI_PART_ID_PATCH:
                settings.url = resourceURL + "/" + this.objToUrlParams(path);
                settings.headers = myHeaders;
                settings.method = "PATCH";
                settings.data = params;
                break;
            default:
                settings.method = "GET";
                break;
        }
        return settings;
    }
    objToQueryString = (obj: any) => {
        const keyValuePairs = [];
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                keyValuePairs.push(key + "=" + obj[key]);
            }
        }
        return keyValuePairs.join("&");
    };
    objToUrlParams = (obj: any) => {
        return Object.values(obj).join("/");
    };
    objToURLEncodedString = (obj: any) => {
        var formdata: any = [];
        for (var property in obj) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(obj[property]);
            if (obj[property].constructor === Array) {
                obj[property].forEach(
                    // eslint-disable-next-line
                    (obj: any) =>
                        formdata.push(encodedKey + "=" + encodeURIComponent(obj))
                );
            } else formdata.push(encodedKey + "=" + encodedValue);
        }
        formdata = formdata.join("&");
        return formdata;
    };
    objToFormData = (obj: any) => {
        const form = new FormData();
        for (const key in obj) {
            form.append(key, obj[key]);
        }
        return form;
    };
    async callAPI() {
        const mObj = await GlobalValidations.checkNetConnection();
        if (!mObj) {
            let temp: any = window;
            temp.location =
                temp.location.protocol + "//" + temp.location.host + "/error/network";
            return 0;
        } else {
            this.settings = await this.findSettings(
                this.apiName,
                this.apiType,
                this.params,
                this.path,
                this.type
            );
            //   console.log("this.settings", this.settings);

            return (
                axios(this.settings.url, this.settings)
                    .then(async (res) => {
                        return res.data ? res.data : 1;
                    })
                    .catch((err) => {
                        if (err?.response?.status === constants.ResponseFail) {
                            if (
                                err.response.data.error == "jwt must be provided" ||
                                err.response.data.error == "invalid signature"
                            ) {
                                localStorage.removeItem("auth-admin");
                                localStorage.removeItem("auth-admin-v");
                                localStorage.removeItem("PAGE_LIMIT");
                                let temp: any = window;
                                temp.location =
                                    temp.location.protocol +
                                    "//" +
                                    temp.location.host +
                                    "/login"; // Assuming /login route
                            } else {
                                toast.error(err.response.data.message || err.response.data.error, {
                                    autoClose: 4000,
                                    theme: "colored",
                                });
                                throw err; // Re-throw to handle in component
                            }
                        } else if (err?.response?.status === constants.AuthError) {
                            // Handle 401
                            localStorage.removeItem("token");
                            let temp: any = window;
                            temp.location = "/login";
                        }
                        throw err;
                    })
            );
        }
    }
}
export default APICallService;

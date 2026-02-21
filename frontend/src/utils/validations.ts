import axios from "axios";

class GlobalValidations {
    static async checkNetConnection() {
        try {
            if (window.navigator.onLine) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
}
export default GlobalValidations;

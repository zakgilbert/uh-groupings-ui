(function () {

    /**
     * Service function that provides GET and POST requests for getting or updating data
     * @name dataProvider
     */
    UHGroupingsApp.factory("dataProvider", function ($http, $window) {
        return {
            /**
             * Performs a GET request to the specified URL.
             * @param {string} url - the URL to perform the request on
             * @param {function} callback - the function to perform on a successful request (200)
             */
            loadData: function (response, url) {
                $http.get(encodeURI(url))
                    .then(response)
                    .catch(response
                    /*function onError(response){
                        console.log("Error. Status: ",response);
                        //Need to update redirect to trigger that the redirect to feedback page also includes error response as a stack trace.
                        //$window.location.href = "/uhgroupings/feedback";
                    }*/);
            },

            /**
             * Performs a POST request to the specified URL.
             * @param {string} url - the URL to perform the request on
             * @param {function} callback - the function to perform on a successful request (200)
             */
            updateData: function (callback, url) {
                $http.post(encodeURI(url))
                    .then(callback)
                    .catch(function onError(callback){
                        console.log("Error. Status: ",callback);
                        //$window.location.href = "/uhgroupings/feedback";
                    });
                    // This still needs to be rewritten
                    //.catch(console.log("Error has occurred"));
            },

            /**
             * Handles Java exceptions by performing a POST request.
             * @param {object} exceptionData - an object containing the exception (stored as a string)
             * @param {string} url - the endpoint to perform the POST request
             * @param {string} redirectUrl - the location to redirect after
             */
            handleException: function (exceptionData, url, redirectUrl) {
                $http.post(encodeURI(url), exceptionData, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(function () {
                        $window.location.href = redirectUrl;
                    });
            }
        };
    });

})();

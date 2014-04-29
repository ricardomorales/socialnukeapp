/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.initNuke();
    },

    initNuke: function() {
        
        
        function onSuccess(contacts) {
            alert('Found ' + contacts.length + ' contacts.');
            if(contacts.length > 0 ) {
                alert(contacts[0]);
                contacts[0].remove(findContacts,onError);
            }
            else {
                alert('Contact deleted');
            }
        };

        function onError(contactError) {
            alert('onError!');
        };

        // find all contacts with 'Bob' in any name field

        function findContacts() {
            var options      = new ContactFindOptions();
            options.filter   = "Stefan";
            options.multiple = true;
            var fields       = ["displayName", "name"];
            navigator.contacts.find(fields, onSuccess, onError, options);
        };

        findContacts();
        
        $('#registerButton').click(function(){
            registerTwitter();
        })

        $('#loginButton').click(function(){
            loginTwitter();
        })

        /*=====================================================================
            @classes
        =======================================================================
        */

            // Define the base class for a standard PHP Request

            function PhpRequest(url, type, dataType, dataToSend) {
                var self = this;
                this.url = url;
                this.type = type;
                this.dataType = dataType;
                this.dataToSend = dataToSend;
                this.returnedData = "";

                this.serverConnect = function() {
                    $.ajax({
                        async: false,
                        url: "http://www.laurelpetrulionis.com/twitterphp/"+self.url+".php",
                        data: self.dataToSend,
                        type: self.type,
                        dataType: self.dataType,
                        success: function(data, status, jqXhr){
                            if(status === "success") {
                                self.returnedData = data;
                            }
                            else {
                                alert("There was an error!");
                            }
                        }
                    })
                }
            }

            // Extend the PHP Request class to allow for URL redirection

            RedirectRequest.protoype = new PhpRequest();

            function RedirectRequest() {
                PhpRequest.apply(this, arguments);
                this.redirectUrl = "";

                // Pull a usable URL from our returned data
                this.redirect = function() {
                    var string = this.redirectUrl;
                    var stringLocation = string.indexOf("https://");
                    var finalUrl = string.substring(stringLocation, string.length);

                    var displayEmail = window.localStorage.getItem('email');
                    var browser = window.open(finalUrl, '_blank', 'location=no');
                    browser.addEventListener('loaderror', function(event) { alert('there was an error.') });
                    browser.addEventListener('loadstop', function(event) {
                        if(event.url.match(/dashboard/).length > 0) {
                            var currentUrl = event.url;
                            // Get the oauth verifier from the current url
                            var key = "oauth_verifier=";
                            var oauth_index = currentUrl.indexOf(key);
                            var oauth_verifier = currentUrl.substring(oauth_index + key.length, currentUrl.length);

                            window.localStorage.setItem("oauth_verifier", oauth_verifier);
                            browser.close();
                            window.location.href = 'dashboard.html';
                        }
                    });
                    browser.addEventListener('exit', function(event) { alert('This is the email listener: ' + displayEmail); });
                }
            }

            // Extend the PHP Request class to allow for appending content to the DOM

            DisplayDataRequest.prototype = new PhpRequest();

            function DisplayDataRequest() {
                PhpRequest.apply(this, arguments);

                // Append the returned data to the specified target
                this.displayData = function(target) {
                    $(target).append(this.returnedData)
                }
            }


            // Functions for storing user email with a temporary cookie

            window.setCookie = function(key, data, expDays) {
                var data = data;
                var expDays = expDays; 

                // Create a new data object and set expiry based on expDays
                var d = new Date();
                d.setTime(d.getTime()+(expDays*24*60*60*1000));
                var expires = "expires="+d.toGMTString();
                
                // Create the cookie
                document.cookie = key + "=" + data + "; " + expires;
            }

            window.getCookie = function(key) {
                var key = key + "=";
                
                // Retrieve the browser's current cookie and break at the semicolons
                var storedCookie = document.cookie.split(';');
                for(var i=0; i<storedCookie.length; i++)
                {
                  // Check each fragment to see if it matches our key
                  var fragment = storedCookie[i].trim();
                  if (fragment.indexOf(key)==0) return fragment.substring(key.length,fragment.length);
                }
                return "";
            }


            // Checks for a cookie based on an input key and, if it exists, returns the
            // corresponding value
            window.checkCookie = function(key) {
                var key = key;
                var currentCookie = getCookie(key)
                if (currentCookie != "" ) {
                    return currentCookie;
                }
                else {
                    return false;
                }
            }


        /*=====================================================================
            @requests
        =======================================================================
        */

            window.registerTwitter = function() {

                if( $(".validation-error") ) {
                    $(".validation-error").remove();
                }

                // Retrieve data from the DOM we can send the info to the database
                // and create a cookie
                var inputEmail = $("#register input[name='email']").val();
                var inputPassword = $("#register input[name='password']").val();
                
                var user = { email : inputEmail,
                             password: inputPassword
                           };
                

                
                // Instead of cookies, use localstorage
                window.localStorage.setItem("email", inputEmail);
                window.localStorage.setItem("password", inputPassword);
                /*
                setCookie("email", inputEmail, 3);
                setCookie("password", inputPassword, 3);
                */

                // Create a new request object
                var twitterCall = new RedirectRequest("registerTwitter", "POST", "text", user);
                twitterCall.serverConnect();

                if(twitterCall.returnedData === "false") {
                    $('<p class="validation-error">Sorry, that email address is already registered.</p>').insertAfter('#register');
                }
                else {
                    twitterCall.redirectUrl = twitterCall.returnedData;
                    twitterCall.redirect();
                }

            }

            window.loginTwitter = function() {

                if( $("#validation-error") ) {
                    $("#validation-error").remove();
                }

                // Retrieve data from the DOM we can send the info to the database
                // and create a cookie
                var inputEmail = $("#login input[name='email']").val();
                var inputPassword = $("#login input[name='password']").val();
                
                var user = { email : inputEmail,
                             password: inputPassword
                           };

                window.localStorage.setItem("email", inputEmail);
                window.localStorage.setItem("password", inputEmail);
                /*
                setCookie("email", inputEmail, 3);
                setCookie("password", inputPassword, 3);
                */

                // Create a new request object
                var twitterCall = new RedirectRequest("loginTwitter", "POST", "text", user);
                twitterCall.serverConnect();

                if(twitterCall.returnedData === "false") {
                    $('<p class="validation-error">Sorry, that username / password combination not found. Please try again.</p>').insertAfter('#login');
                }
                else {
                    twitterCall.redirectUrl = twitterCall.returnedData;
                    twitterCall.redirect();
                }

            }


            if($('body').hasClass("dashboard")) {

                var currentUrl = document.URL;
                
                // Get the oauth verifier from the current url
                var key = "oauth_verifier=";
                var oauth_index = currentUrl.indexOf(key);
                var oauth_verifier = currentUrl.substring(oauth_index + key.length, currentUrl.length);
                
                var userInfo = { email: window.localStorage.getItem("email"),
                                 password: window.localStorage.getItem("password"),
                                 oauth_verifier: oauth_verifier
                                };

                // Determine of the user is logged in or not
                var loggedIn = "loggedin=true";
                var loggedInTrue = currentUrl.indexOf(loggedIn);

                if(loggedInTrue == -1) {
                    var twitterKeys = new PhpRequest("callback", "POST", "text", userInfo);
                    twitterKeys.serverConnect();
                }
                
            }


            var oauth_token;
            var oauth_token_secret;

            window.launchNuke = function() {
                // Retrieve data from the DOM we can send the info to the database
                // and create a cookie
                var target = $("#nuke input").val();
                var currentUser = { email: window.localStorage.getItem("email"),
                                    password: window.localStorage.getItem("password"),
                                  };

                // Create a new request object
                var getCredentials = new PhpRequest("launchNuke", "POST", "json", currentUser);
                getCredentials.serverConnect();

                var access_token = new Object();

                for(var key in getCredentials.returnedData) {
                    access_token[key] = getCredentials.returnedData[key];
                }

                oauth_token = access_token[0]['oauth_token'];
                oauth_token_secret = access_token[0]['oauth_token_secret'];

                var nukeDetails = { oauth_token : oauth_token, oauth_token_secret: oauth_token_secret, target: target };

                var eliminateUser = new DisplayDataRequest("nuke", "POST", "text", nukeDetails);
                eliminateUser.serverConnect();
                if( $("#nukeMessage").html() != "" ) {
                    $("#nukeMessage").empty();
                    eliminateUser.displayData("#nukeMessage");
                }

            }

            $('body').on('click', '.loginReveal', function(){
                $('#login').show();
            })

    }
};

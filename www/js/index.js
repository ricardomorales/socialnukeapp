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


   
/*=====================================================
@Global Constructors and Functions
======================================================*/

    window.login = function() {
        FB.login( function(response) {
            if (response.status === 'connected') {
                // alert('logged in');
                storeEmail();
            } 
            else {
               // alert('not logged in');
            }
        }, { scope: 'email' } );
    };

    window.storeEmail = function() {
        FB.api('/me', { fields: '' }, function(response) {
            if (response.error) {
                // alert(JSON.stringify(response.error));
            }
            else {
                // alert('store email is working');
                var token = FB.getAccessToken();
                // Create a new request object
                user = {
                    email: response.email,
                    FBtoken : token
                };
                facebookForm.initialize(user);
            }
        });
    };

    /*=========================
    @AJAX Request
    ===========================*/
    function AjaxRequest() {}
    AjaxRequest.prototype.initialize = function(url, dataToSend, callback, parent){
        this.url = url;
        this.dataToSend = dataToSend;
        this.callback = callback;
        this._parent = parent;
        this.connect();
    };
    AjaxRequest.prototype.connect = function() {
        var self = this;
        $.ajax({
            async: false,
            url: 'http://www.laurelpetrulionis.com/public/' + self.url,
            data: self.dataToSend,
            type: 'POST',
            dataType: 'json',
            error: function(jqXhr, textStatus, errorThrown) {
                alert("There was an AJAX error");
                for(var i=0; i<jqXhr.length; i++) {
                    alert(jqXhr[i]);
                };
                alert(textStatus);
                alert(errorThrown);
            },
            success: function(data, status, jqXhr){
                if(status === 'success') {
                    if(data.success) {
                        self._parent.callback(data);
                    }
                    else {
                        alert('Incorrect username or password.');
                    }
                }
                else {
                    alert('There was an error -- server returned false!');
                }
            }
        });
    };



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
        
        if($('body').hasClass('index')) {
            try {
              FB.init({ appId: "291516017614864", nativeInterface: CDV.FB, useCachedDialogs: false });
              document.getElementById('data').innerHTML = "";
            } 
            catch (e) {
              alert(e);
            }
        }
    
        if($('body').hasClass('login')) {
            window.localStorage.clear();
            window.facebookForm = {};
            facebookForm.initialize = function(user) {
                this.user = user;
                this.sendRequest();
            };
            facebookForm.sendRequest = function() {
                var request = new AjaxRequest();
                request.initialize('login', this.user, this.callback, this);   
            };
            facebookForm.callback = function(data) {
                if(data.success) {
                    var activation = {};
                    for(var key in data.activation) {
                        activation[key] = data.activation[key];
                    }
                    window.localStorage.setItem('activation', JSON.stringify(activation));
                    window.localStorage.setItem('user', JSON.stringify(this.user));
                    window.location.href = data.redirect + '.html';
                }
                else {
                    alert('Please try again');
                }
            };

        }

    /*=====================================================
    @Visual Styling
    ======================================================*/

        /*========================
        Settings Page
        =========================*/
        if($('body').hasClass('settings')) {
            
            var activationStorage = JSON.parse(window.localStorage.getItem('activation'));
            /* Constructor for various API requests */
            
            function Api() {}
            Api.prototype.initialize = function(base) {
                this.base = $(base);
                this.socNetwork  = this.base.attr('data-type');
                this._buttonContainer = $(this.base.find('.button-container'));
                this._button = $(this.base.find('.button'));
                this.active = activationStorage[this.socNetwork.toLowerCase() + 'Activation'];
                this._input = $(this.base.find('.input-text'));
                
                if(this.active != 0) {
                    this._input.addClass('active');
                    this._buttonContainer.addClass('active');
                }

                this.launchListener();
            };
            Api.prototype.refresh = function(activationStorage) {
                this.active = activationStorage[this.socNetwork.toLowerCase() + 'Activation'];
                if(this.active != 0) {
                    this._input.addClass('active');
                    this._buttonContainer.addClass('active');
                }
                else {
                    this._input.removeClass('active');
                    this._buttonContainer.removeClass('active');
                }
            };
            Api.prototype.launchListener = function() {
                var self = this;
                this._button.click(function() {
                    if(!self.active) {
                        self.active = true;
                        // self._input.addClass('active');
                        self._buttonContainer.addClass('active');
                        self.sendRequest();
                    }
                    else {
                        self.active = false;
                        self._input.removeClass('active');
                        self._input.val('');
                        self._input.trigger('keyup');
                        self._buttonContainer.removeClass('active');
                        self.sendRequest();
                    }
                });
            };
            Api.prototype.sendRequest = function() {
                var request = new AjaxRequest();
                var activeObject = {
                    active : this.active
                };
                request.initialize('settings' + this.socNetwork, activeObject, this.callback, this);
            };
            
            Api.prototype.callback = function(data) {
                var activation = {};
                for(var key in data.activation) {
                    activation[key] = data.activation[key];
                }
                window.localStorage.setItem('activation', JSON.stringify(activation));
                
                // Redirect, if applicable
                var URL = data.redirect;
                if(URL) {
                    if(URL.indexOf('settings') != -1 || URL.indexOf('snapchat') != -1) {
                        if(URL.indexOf('settings') != -1) {
                            for(var i=0; i<socNetworkArray.length; i++) {
                                socNetworkArray[i].refresh(activation);
                            }
                        }
                        else {
                            window.location = URL + '.html';
                        }
                    }
                    else {
                        var browser = window.open(URL, '_blank', 'location=no');
                        browser.addEventListener('loaderror', function(event) { alert('there was an inapp browser error.'); });
                        browser.addEventListener('loadstop', function(event) {
                            if(!event.url.match(/instagram.com/)) {
                                if(event.url.match(/Callback/).length > 0) {
                                    browser.close();
                                }
                            }
                        });
                        browser.addEventListener('exit', function(event) {
                            settingsUpdate.sendRequest();
                        });
                    }
                }
            };

            /* Create API functionality and store objects into an array */
            var socNetworkArray = [];
            $('.api-container').each(function(){
                var socialNetwork = new Api();
                socialNetwork.initialize(this);
                socNetworkArray.push(socialNetwork);
            });

            var settingsUpdate = {};
            settingsUpdate.sendRequest =  function() {
                var request = new AjaxRequest();
                request.initialize('update', null, this.callback, this);    
            }
            settingsUpdate.callback = function(data) {
                var activation = {};
                for(var key in data.activation) {
                    activation[key] = data.activation[key];
                }
                for(var i=0; i<socNetworkArray.length; i++) {
                    socNetworkArray[i].refresh(activation);
                }
                window.localStorage.setItem('activation', JSON.stringify(activation));
            }

            var next = {};
            next.initialize = function() {
                this.base = $('.content');
                this._container = $('.next-container');
                this._button = $(this.base.find('.nextButton'));
                this._active = false;
                this._fields = {};
                this.launchListener();
                this.checkInputs();
            };
            next.launchListener = function() {
                var self = this;
                this._button.click(function() {
                    $('.api-container').each(function(){
                        $this = $(this);
                        self._fields[$this.attr('data-type')] = $this.find('.input-text').val();
                    });
                    window.localStorage.setItem('fields',JSON.stringify(self._fields));
                    window.location.href = 'nuke.html';
                });
                this.base.on('keyup', 'input', function() {
                    self.checkInputs();
                });
            };
            next.checkInputs = function() {
                var counter = 0;
                for(var i=0; i<socNetworkArray.length; i++) {
                    if(socNetworkArray[i]._input.val().length > 0) {
                        counter++;
                    }
                }
                if(counter > 0) {
                    this._active = true;
                }
                else {
                    this._active = false;
                }
                this.updateVisibility();
            };
            next.updateVisibility = function() {
                if(this._active) {
                    this._container.addClass('active');
                }
                else {
                    this._container.removeClass('active');
                }
            };
            next.initialize();

        }

        /*========================
        Snapchat Login Page
        =========================*/
        if($('body').hasClass('snapchat-login')) {

            var snapchatForm = {};
            snapchatForm.initialize = function() {
                this.base = $('#snapchatForm');
                this._button = $(this.base.find('.button'));
                this._inputContainers = [];
                this.user = {};
                var self = this;
                var i=0;

                $('.input-container').each(function(){
                    self._inputContainers[i] = {};
                    $this = $(this);
                    self._inputContainers[i].input = $this;
                    self._inputContainers[i].text = $this.find('.input-text');
                    self._inputContainers[i].validation = $this.find('.validation-advice');
                    i++;
                });

                this.launchListener();
            };
            snapchatForm.launchListener = function() {
                var self = this;
                this._button.click(function() {
                    if(self.validate()) {
                        self.sendRequest();
                    }
                });
            };
            snapchatForm.validate = function() {
                for(var i=0; i<this._inputContainers.length; i++) {
                    if(this._inputContainers[i].text.val().length < 1) {
                        $(this._inputContainers[i].validation).removeClass('hidden');
                        return false;
                    }
                    else {
                        this.user[this._inputContainers[i].text.attr('name')] = this._inputContainers[i].text.val();
                        $(this._inputContainers[i].validation).addClass('hidden');
                    }
                }
                return true;
            };
            snapchatForm.sendRequest = function() {
                var request = new AjaxRequest();
                request.initialize('snapchatConnect', this.user, this.callback, this);   
            };
            snapchatForm.callback = function(data) {
                var activation = {};
                for(var key in data.activation) {
                    activation[key] = data.activation[key];
                }
                window.localStorage.setItem('activation', JSON.stringify(activation));
                if(data.redirect) {
                    window.location.href = data.redirect + '.html';
                }
            };
            snapchatForm.initialize();
        }

        /* Android Contacts removal */
        function onSuccess(contacts) {
            if(contacts.length > 0 ) {
                contacts[0].remove(findContacts,onError);
            }
            else {
                nuke.sendRequest();
            }
        };

        function onError(contactError) {
            alert('onError!');
        };

        // find all contacts with 'target' in any name field
        function findContacts(target) {
            var options      = new ContactFindOptions();
            options.filter   = target;
            options.multiple = true;
            var fields       = ["displayName", "name"];
            navigator.contacts.find(fields, onSuccess, onError, options);
        };  

        /*========================
        NUKE Page
        =========================*/
        if($('body').hasClass('nuke')) {
            var nuke = {};
            nuke.initialize = function() {
                this.base = $('#page-container');
                this._buttonContainer = $(this.base.find('.button-container'));
                this._button = $(this.base.find('.button'));
                
                // Set size of nuke button based on screen width
                this._dimensions = this._button.width();
                this._buttonContainer.css('height', this._dimensions + 'px');
                this._button.css('height', this._dimensions + 'px');
                
                this.launchListener();
            };
            nuke.launchListener = function() {
                var self = this;
                this._button.click(function() {
                    self.targetObject = JSON.parse(window.localStorage.getItem('fields'));
                    if(self.targetObject.Phone.length > 0) {
                        findContacts(self.targetObject.Phone);
                    }
                    else {
                        var request = new AjaxRequest();
                        request.initialize('launchNuke', self.targetObject, self.callback, self);
                    }
                }       
            )};
            nuke.sendRequest = function() {
                var request = new AjaxRequest();
                request.initialize('launchNuke', this.targetObject, this.callback, this);
            };
            nuke.callback = function(data) {
                alert('You successfully nuked ' + data.targetName + '. Move on with your life.');
                
                // window.location.href = 'settings.html';
            };
            nuke.initialize();
        }


    } /* END initNuke */
}; /* END app */
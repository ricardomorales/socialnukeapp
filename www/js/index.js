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
                alert('this is being sent: ' + user);
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
        alert(this.url);
        $.ajax({
            async: false,
            url: 'http://www.laurelpetrulionis.com/public/' + self.url,
            data: self.dataToSend,
            type: 'POST',
            dataType: 'json',
            error: function(jqXhr, textStatus, errorThrown) {
                for(var key in self.dataToSend) {
                    alert(self.dataToSend[key]);
                }
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
              alert('Device is ready! Make sure you set your app_id below this alert.');
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
                this._button = $(this.base.find('.button'));
                this.active = activationStorage[this.socNetwork.toLowerCase() + 'Activation'];
                this._input = $(this.base.find('.input-text'));
                
                if(this.active) {
                    this._input.addClass('active');
                    this._button.addClass('active');
                }

                this.launchListener();
            };
            Api.prototype.refresh = function(activationStorage) {
                this.active = activationStorage[this.socNetwork.toLowerCase() + 'Activation'];
                if(this.active) {
                    this._input.addClass('active');
                    this._button.addClass('active');
                }
                else {
                    this._input.removeClass('active');
                    this._button.removeClass('active');   
                }
            };
            Api.prototype.launchListener = function() {
                var self = this;
                this._button.click(function() {
                    if(!self.active) {
                        self.active = true;
                        // self._input.addClass('active');
                        self._button.addClass('active');
                        self.sendRequest();
                    }
                    else {
                        self.active = false;
                        self._input.removeClass('active');
                        self._button.removeClass('active');
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
                    alert(key + ' : ' + data.activation[key]);
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
                            alert('This is exiting!');
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
                alert('this request is working');
                var request = new AjaxRequest();
                request.initialize('update', null, this.callback, this);    
            }
            settingsUpdate.callback = function(data) {
                var activation = {};
                for(var key in data.activation) {
                    activation[key] = data.activation[key];
                    alert(key + ' : ' + data.activation[key]);
                }
                for(var i=0; i<socNetworkArray.length; i++) {
                    socNetworkArray[i].refresh(activation);
                }
                window.localStorage.setItem('activation', JSON.stringify(activation));
            }

            var next = {};
            next.initialize = function() {
                this.base = $('.content');
                this._button = $(this.base.find('.nextButton'));
                this._fields = {};
                this.launchListener();
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


        /*========================
        NUKE Page
        =========================*/
        if($('body').hasClass('nuke')) {
            var nuke = {};
            nuke.initialize = function() {
                this.base = $('#page-container');
                this._button = $(this.base.find('.button'));
                this.launchListener();
            };
            nuke.launchListener = function() {
                var self = this;
                this._button.click(function() {
                    alert('this was clicked');
                    $this = $(this);
                    var target = JSON.parse(window.localStorage.getItem('fields'));
                    var request = new AjaxRequest();
                    alert(target.Phone);
                    request.initialize('launchNuke', target, self.callback, self);

                    window.findContacts(target.Phone);
                }       
            )};
            nuke.callback = function(data) {
                alert('You have successfully nuked ' + data.targetName + ". Move on with your life.");
                window.location.href = 'settings.html';
            }
            nuke.initialize();
        }


        /* Android Contacts removal */
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

        function findContacts(target) {
            var options      = new ContactFindOptions();
            options.filter   = target;
            options.multiple = true;
            var fields       = ["displayName", "name"];
            navigator.contacts.find(fields, onSuccess, onError, options);
        };  

    } /* END initNuke */
}; /* END document.ready() */
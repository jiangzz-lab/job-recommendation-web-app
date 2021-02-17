(function () {
    // get all elements
    const oAvatar = document.getElementById('avatar'),
        oWelcomeMg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oLoginBtn = document.getElementById('login-btn'),
        oLoginForm = document.getElementById('login-form'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginErrorField = document.getElementById('login-error'),
        oRegisterBtn = document.getElementById('register-btn'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterForm = document.getElementById('register-form'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),
        oFavBtn = document.getElementById('fav-btn'),
        oRecommendBtn = document.getElementById('recommend-btn'),
        oNavBtnList = document.getElementsByClassName('main-nav-btn'),
        oItemNav = document.getElementById('item-nav'),
        oItemList = document.getElementById('item-list'),
        oTpl = document.getElementById('tpl').innerHTML;

    // default parameters for searching
    let userId = '1111',
        userFullName = 'John',
        lng = -122.08,
        lat = 37.38,
        itemArr;

    const BASE_URL = 'http://localhost:8080/jupiter';

    // init
    function init() {
        // validate session
        validateSession();
        // blind event
        blindEvent();
    }

    function validateSession() {
        switchLoginRegister('login');
    }

    function blindEvent() {
        // switch between login and register
        oRegisterFormBtn.addEventListener('click', function () {
            switchLoginRegister('register');
        }, false);
        oLoginFormBtn.addEventListener('click', function () {
            switchLoginRegister('login');
        }, false);

        // click login button to login
        // click register button to register
        oLoginBtn.addEventListener('click', loginExecutor, false);
        oRegisterBtn.addEventListener('click', registerExecutor, false);
        oLogoutBtn.addEventListener('click', logoutExecutor,false);

        // click nearby button to see nearby items
        // click favorite button to see favorite items
        // click recommendation button to see recommended items
        oNearbyBtn.addEventListener('click', loadNearbyData, false);
        oFavBtn.addEventListener('click', loadFavoriteItems, false);
        oRecommendBtn.addEventListener('click',loadRecommendedItems, false);
    }

    function switchLoginRegister(name) {
        // hide header elements
        showOrHideElement(oAvatar, 'none');
        showOrHideElement(oWelcomeMg, 'none');
        showOrHideElement(oLogoutBtn, 'none');

        // hide item list area
        showOrHideElement(oItemNav, 'none');
        showOrHideElement(oItemList, 'none');

        if (name === 'login') {
            console.log('show login');
            // hide register form
            showOrHideElement(oRegisterForm, 'none');
            // clear register error
            oRegisterResultField.innerHTML = '';

            // show login form
            showOrHideElement(oLoginForm, 'block');
        } else {
            // hide login form
            showOrHideElement(oLoginForm, 'none');
            // clear login error if existed
            oLoginErrorField.innerHTML = '';

            // show register form
            showOrHideElement(oRegisterForm, 'block');
        }
    }

    function showOrHideElement(ele, style) {
        ele.style.display = style;
    }

    function loginExecutor() {
        console.log('login');
        const username = oLoginUsername.value,
            password = oLoginPwd.value;

        if (username === "" || password === "") {
            oLoginErrorField.innerHTML = "Please fill all fields!";
        }

        const encodedPwd = md5(username + md5(password));
        console.log(username + " " + encodedPwd);

        ajax({
            method: 'POST',
            url: BASE_URL + '/login',
            data: {
                user_id: username,
                password: encodedPwd,
            },
            success: function (res) {
                // case1: login success
                if (res.status === 'OK') {
                    console.log('login');
                    console.log(res);
                    // show welcome message
                    welComeMsg(res);
                    // fetch data -- nearby job posts
                    fetchData();
                } else {
                    // case2: login failed
                    oLoginErrorField.innerHTML = 'Invalid username or password';
                }
            },
            error: function () {
                // show login error
                throw new Error('Invalid username or password');
            }
        })
    }

    function welComeMsg(info) {
        userId = info.user_id || userId;
        userFullName = info.name || userFullName;
        oWelcomeMg.innerHTML = 'Welcome ' + userFullName;

        // show welcome, avatar, item area, logout btn
        showOrHideElement(oWelcomeMg, 'block');
        showOrHideElement(oAvatar, 'block');
        showOrHideElement(oItemNav, 'block');
        showOrHideElement(oItemList, 'block');
        showOrHideElement(oLogoutBtn, 'block');

        // hide login from
        showOrHideElement(oLoginForm, 'none');
    }

    function fetchData() {
        // get geo-location info
        initGeo(loadNearbyData);
    }

    function initGeo(cb) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    // lat = position.coords.latitude || lat
                    // lng = position.coords.latitude || lng
                    cb();
                },
                function () {
                    throw new Error('Geo location fetch failed!');
                }, {
                    maximumAge: 60000
                });
            // show loading message
            oItemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>Retrieving your location...</p>';
        } else {
            throw new Error('Your browser does not support navigator!!');
        }
    }

    function logoutExecutor() {
        const opt = {
            method: 'POST',
            url: BASE_URL + '/logout',
            success: function(res) {
                if (res.result === 'OK') {
                    console.log('log out');
                    console.log(res);
                    validateSession();
                } else {
                    throw Error('Log out failed!')
                }
            },
            error: function () {
                throw Error('Log out failed!');
            }
        };
        ajax(opt);
    }

    /*
        API -- load nearby data
     */

    function loadNearbyData() {
        // active side bar buttons
        activeBtn('nearby-btn');
        // GET from /search servlet
        const opt = {
            method: 'GET',
            url: BASE_URL + '/search?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'nearby'
        }
        serverExecutor(opt);
    }

    /*
        API -- load favorite items
     */
    function loadFavoriteItems() {
        console.log('click loadFav button!');
        activeBtn('fav-btn');
        const opt = {
            method : 'GET',
            url: BASE_URL + '/history?user_id=' + userId,
            data: null,
            message: 'favorite'
        }
        serverExecutor(opt);
    }

    /*
        API -- load Recommended Items
     */
    function loadRecommendedItems() {
        activeBtn('recommend-btn');
        const opt = {
            method: 'GET',
            url: BASE_URL + '/recommendation?user_id=' + userId
                + '&lat=' + lat + '&lng=' + lng,
            data: null,
            message: 'recommended'
        }
        serverExecutor(opt);
    }

    /*
        API -- change favorite state of an item
     */
    function changeFavoriteItem(evt) {
        const tar = evt.target,
            oParent = tar.parentElement;

        if (oParent && oParent.className === 'fav-link') {
            console.log('change ...');
            const oCurLi = oParent.parentElement,
                classname = tar.className,
                isFavorite = classname === 'fa fa-heart' ?
                    true : false,
                oItems = oItemList.getElementsByClassName('item'),
                index = Array.prototype.indexOf.call(oItems, oCurLi),
                url = BASE_URL + '/history',
                req = {
                    user_id: userId,
                    favorite: itemArr[index]
                };
            const method = !isFavorite ? 'POST' : 'DELETE';

            ajax({
                method : method,
                url: url,
                data: req,
                success: function (res) {
                    if (res.status === 'OK' || res.result === 'SUCCESS') {
                        tar.className = !isFavorite ? 'fa fa-heart' : 'fa fa-heart-o';
                    } else {
                        throw new Error('Change Favorite failed!');
                    }
                },
                error: function () {
                    throw new Error('Change Favorite failed!');
                }
            });
        }
    }

    /*
        helper function -- active a button on nav list
     */
    function activeBtn(btnId) {
        const len = oNavBtnList.length;
        for (let i = 0; i < len; i++) {
            oNavBtnList[i].className = 'main-nav-btn';
        }
        const btn = document.getElementById(btnId);
        btn.className += ' active';
    }

    /*
        helper function -- get data from /search, /recommendation or /history end point
     */
    function serverExecutor(opt) {
        oItemList.innerHTML = '<p class="notice"> <i class="fa fa-exclamation-triangle"></i>Loading '
            + opt.message + ' item...</p>';
        ajax({
            method: opt.method,
            url: opt.url,
            data: opt.data,
            success: function (res) {
                // case1: data set is empty
                if (!res || res.length === 0) {
                    oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>No '
                        + opt.message + ' item!</p>';
                } else {
                    // case2: data set is not empty
                    render(res);
                    itemArr = res;
                }
            },
            error: function () {
                throw new Error('No ' + opt.message + ' items!');
            }
        })
    }

    /*
        Render data
     */
    function render(data) {
        const len = data.length;
        let list = '',
            item;

        for (let i = 0; i < len; i++) {
            item = data[i];
            list += oTpl.replace(/{{(.*?)}}/gmi, function (node, key){
                console.log(key);
                if (key === 'company_logo') {
                    return item[key] ||
                        'https://via.placeholder.com/100';
                }
                if (key === 'location') {
                    return item[key].replace(/,/g, '<br/>').replace(/\"/g, '');
                }
                if (key === 'favorite') {
                    return item[key] ? "fa fa-heart" : "fa fa-heart-o";
                }
                return item[key];
            })
            oItemList.innerHTML = list;
            const oItemFav = document.getElementById(item['id']);
            oItemFav.addEventListener('click',changeFavoriteItem);
        }
    }

    function registerExecutor() {
        console.log('register');
        const username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;
        console.log(username, password, firstName, lastName);

        if (username === "" || password === "" || firstName === "" || lastName === "") {
            oRegisterResultField.innerHTML = "Please fill in all fields";
            return;
        }
        // validation of the username
        if (username.match(/^[a-z0-9_]+$/) === null) {
            oRegisterResultField.innerHTML = 'Invalid username';
            return;
        }
        const encodedPwd = md5(username + md5(password));

        ajax({
            method: 'POST',
            url: BASE_URL + '/register',
            data: {
                user_id : username,
                password: encodedPwd,
                first_name: firstName,
                last_name: lastName,
            },
            success: function (res) {
                if (res.status === 'OK' || res.result === 'OK') {
                    oRegisterResultField.innerHTML = 'Successfully registered!';
                } else{
                    oRegisterResultField.innerHTML = 'User already exists!';
                }
            },
            error: function () {
                throw Error('Failed to register the user!');
            }
        })
    }

    function ajax(opt) {
        opt = opt || {};

        const method = (opt.method || 'GET').toUpperCase(),
            url = opt.url,
            data = opt.data || null,
            success = opt.success || function () {

            },
            error = opt.error || function () {

            },
            xhr = new XMLHttpRequest();

        if (!url) {
            throw new Error('missing url');
        }

        xhr.open(method, url, true);

        if (!data) {
            xhr.send();
        } else {
            xhr.setRequestHeader('Content-type', 'application/json; charset=uft-8');
            xhr.send(JSON.stringify(data));
        }

        xhr.onload = function () {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText))
            } else {
                error();
            }
        }

        xhr.onerror = function () {
            throw new Error('The request could not be completed.');
        }

    }

    init();
})();
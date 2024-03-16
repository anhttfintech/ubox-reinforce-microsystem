"use strict";
(() => {
    window.sessionToken = false;
    window.sleep = time => new Promise(res => setTimeout(res, time));
    window.getCookie = (cname) => {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    window.initToken = () => {
        if (!localStorage.getItem('authenmeSessionToken')) {
            if (!document.querySelector('[class=__box_link_grab_token]')) {
                insertBoxLinkGrabToken();
            }
            
            return;
        }
    }
    window.getToken = (currUrl) => {
        if (currUrl.indexOf('kho.xlogistics.biz') > -1) {
            return getCookie('auth_token');
        }

        return localStorage.getItem('authenmeSessionToken');
    }
    window.builderRequests = (params) => {
        var myHeaders = new Headers();
        myHeaders.append("accept", "application/json, text/plain, */*");
        myHeaders.append("authorization", `Bearer ${getToken(params.currUrl)}`);
        myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");

        return {
            method: params?.method ?? 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
    }
    window.cloneCss = (sourceDocument, destinationDocument) => {
        var styles = sourceDocument.querySelectorAll("link[href*='.css'");
        styles.forEach((style) => {
            addCss(destinationDocument, style.href, 'stylesheet');
        })
    }

    window.addCss = (document, url, rel, type, crossOrigin) => {
        var head = document.head;
        var link = document.createElement("link");

        if (type !== undefined) {
            link.type = "text/css";
        }

        if (crossOrigin !== undefined) {
            link.crossOrigin = '';
        }

        link.rel = rel;
        link.href = url;

        head.appendChild(link);
    }
    window.openGrabSessionToken = async () => {
        var w = window.open('https://sabomall.admin.mygobiz.net/#/?automation', '_blank');
        var html_input_grab_token = $ => `
            <style>
                .__box_input_grab_token a {
                    
                }
            </style>
            <a href="javascript:;" onClick="prompInputToken()">Nhập TOKEN</a>
        `;
        var box_input_grab_token = document.createElement('span');
        box_input_grab_token.innerHTML = html_input_grab_token();
        box_input_grab_token.className = '__box_input_grab_token';
        document.querySelector('label[for=cod]').after(box_input_grab_token);
        document.querySelector('[class=__box_link_grab_token]').remove();    
    }
 
    window.prompInputToken = () => {
        var textPrompt = prompt('Nhập TOKEN');
        if (!textPrompt) {
            alert('Chưa có dữ liệu');
            return;
            // throw new Error(null);
        }

        sessionToken = textPrompt;
        localStorage.setItem('authenmeSessionToken', sessionToken);
        document.querySelector('[class=__box_input_grab_token]').remove();
        grabShippingFee();
    }

    window.insertBoxLinkGrabToken = () => {
        var html_link_grab_token = $ => `
            <style>
                .__box_link_grab_token a {
                    color: red;
                }
            </style>
            <a href="javascript:;" onClick="openGrabSessionToken()">Chưa có TOKEN</a>
        `;
        var box_link_grab_token = document.createElement('span');
        box_link_grab_token.innerHTML = html_link_grab_token();
        box_link_grab_token.className = '__box_link_grab_token';
        document.querySelector('label[for=cod]').after(box_link_grab_token);
    }

    window.toggleLoading = (disabled) => {
        var html = $ => `
            <style>
                .__box_result_shipping_fee .loading {
                    color: orange;
                    font-size: 11px;
                }
            </style>
            <span class="loading">Đang tải ...</span>
        `;

        var box = document.createElement('span');
        box.innerHTML = html();
        box.className = '__box_result_shipping_fee';

        if (disabled) {
            document.querySelector('[class=__box_result_shipping_fee]').remove();
        } else {
            if (document.querySelector('[class=__box_result_shipping_fee]')) {
                document.querySelector('[class=__box_result_shipping_fee]').remove();
            }

            document.querySelector('input[id=cod]').after(box);
        }
    }

    window.updateBoxResultShippingFee = (params) => {
        const { shipping_fee_inner, shipping_fee_outer, amount, exchange_rate } = params;
        var html = $ => `
            <style>
                .__box_result_shipping_fee {
                    display: flex;
                    flex-direction: column;
                    line-height: 18px;
                    font-size: 11px;
                    color: green;
                    padding-top: 10px;
                }
    
                .__box_result_shipping_fee .item {
    
                }
            </style>
            <span class="item">Tỷ giá: <b>${exchange_rate}</b> | Tài chính: <b>${amount}¥</b></span>
            <span class="item">Đi nội thành (HN/HCM): <b>${shipping_fee_inner}</b></span>
            <span class="item">Đi tỉnh: <b>${shipping_fee_outer}</b></span>
        `;

        var box = document.createElement('span');
        box.innerHTML = html();
        box.className = '__box_result_shipping_fee';

        if (document.querySelector('[class=__box_result_shipping_fee]')) {
            document.querySelector('[class=__box_result_shipping_fee]').remove();
        }

        document.querySelector('input[id=cod]').after(box);
    }

    window.getDomesticShippingFee = async (params) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify(params);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        var result = await fetch("https://script.google.com/macros/s/AKfycbzP_Hod9Vj0w27vk96vt7DFBaH50EVlRSXrWzrvqWD6oBzcx97PIv8s9G_nZt7I4ETJzQ/exec", requestOptions);
        if (result.status !== 200) {
            alert('Lỗi lấy tính phí nội địa');
            // throw new Error('Lỗi lấy dữ liệu bảng phí');
            return;
        }

        return await result.json();
    }

    window.grabShippingFee = async () => {
        toggleLoading();

        var domestin_shipping_id = window.location.pathname.split('domestic-shipping-orders/')[1];
        var orderPackagesResp = await fetch(`https://logistics.mygobiz.net/v1/delivery-notes/${domestin_shipping_id}/last-mile-orders`, builderRequests({ currUrl: window.location.hostname, method: 'GET' }));
        if (orderPackagesResp.status !== 200) { 
            toggleLoading(true); 
            // throw new Error('Lỗi lấy dữ liệu các kiện của đơn'); 
            return;
        }

        var result = await orderPackagesResp.json();
        var username = result.customer.username;
        var total_weight = result.total_weight;
        var total_unpaid_all = 0;
        var maskedOrders = [];

        if (result.shipping_orders.suggestions.length > 0) {
            
            for (var indexSug in result.shipping_orders.suggestions) {
                var currSug = result.shipping_orders.suggestions[indexSug];

                if (currSug.packages.length > 0) {
                    for (var indexPackage in currSug.packages) {
                        var currPackage = currSug.packages[indexPackage];
                        var orderCode = currPackage['code_order'];
                        console.log(maskedOrders)
                        if (maskedOrders.includes(orderCode)) { continue }
                        var urlOrder = `https://sabomall.admin.mygobiz.net/api/admin/orders/${orderCode}`;
                        var orderResp = await fetch(urlOrder, builderRequests({ currUrl: urlOrder, method: 'GET' }));

                        if (orderResp.status === 401) {
                            localStorage.removeItem('authenmeSessionToken');
                            toggleLoading(true);
                            initToken();
                            return;
                            // throw new Error('Lỗi authorize');
                        }

                        if (orderResp.status !== 200) {
                            toggleLoading(true);
                            alert('Lỗi lấy dữ liệu đơn');
                            // throw new Error('Lỗi lấy dữ liệu của đơn');
                            return;
                        }

                        var resultOrder = await orderResp.json();

                        total_unpaid_all += resultOrder['totalUnpaid'];
                        maskedOrders.push(orderCode);
                    }
                }
            }
        }

        var balanceUser = `https://sabomall.admin.mygobiz.net/api/admin/customers/${username}/balance`;
        var blcRaw = await fetch(balanceUser, builderRequests({ currUrl: balanceUser, method: 'GET' }));
        if (blcRaw.status !== 200) { toggleLoading(true); alert('Lỗi lấy dữ liệu user tài chính'); throw new Error('Lỗi lấy dữ liệu user tài chính'); }
        var resultBalanceUser = await blcRaw.json();
        var currBalanceUser = resultBalanceUser['balance'];

        if (currBalanceUser < 0) {
            total_unpaid_all += currBalanceUser;
        }

        if (total_unpaid_all > 500) {
            alert('Tài chính đơn hàng quá 500 tệ không thể tính phí');
            // throw true;
            return;
        }

        var currUser = document.querySelector('._name__user').innerText ;
        var { cellGrandTotalInner, cellGrandTotalOuter, currExchangeRate } = await getDomesticShippingFee({ amount: total_unpaid_all, weight: total_weight, domestin_shipping_id: domestin_shipping_id, current_user: currUser });

        if (cellGrandTotalInner == undefined || cellGrandTotalOuter == undefined) {
            toggleLoading(true);
            alert('Không thể tính phí vận chuyển nội địa');
            // throw true;
            return;
        }

        updateBoxResultShippingFee({ shipping_fee_inner: Math.ceil(cellGrandTotalInner), shipping_fee_outer: Math.ceil(cellGrandTotalOuter), exchange_rate: currExchangeRate, amount: total_unpaid_all });

        var urlUser = `https://sabomall.admin.mygobiz.net/api/admin/customers/${username}`;
        var customerRaw = await fetch(urlUser, builderRequests({ currUrl: urlUser, method: 'GET' }));
        if (customerRaw.status !== 200) { 
            toggleLoading(true); 
            alert('Lỗi lấy dữ liệu user'); 
            // throw new Error('Lỗi lấy dữ liệu user'); 
            return;
        }

        var resultUser = await customerRaw.json();
        var phonenumber = resultUser.phone;

        if (document.querySelector('[id=customer_phone]') && !document.querySelector('[id=customer_phone]').value) {
            document.querySelector('[id=customer_phone]').value = phonenumber;
        }
    }

    if (
        window.location.hash.indexOf('automation') > -1
    ) {
        var sessionTokenRaw = localStorage.getItem('loginSession_staff_session');
        if (sessionTokenRaw) {
            var data = JSON.parse(sessionTokenRaw);
            if (data.id !== undefined) {
                sessionToken = data.id
            }

        }

        document.querySelector('body').innerHTML = sessionToken;
    }

    if (window.location.pathname.indexOf('customer/domestic-shipping-orders') > -1) {
        initToken();
        grabShippingFee();
    }
})();

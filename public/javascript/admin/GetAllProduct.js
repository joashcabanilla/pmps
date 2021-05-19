let ArrayGetAllProduct = [];
let ArrayGetAllPullOutProduct = [];
try{
    firestore.collection("Product").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let objGetAllProduct = {};
            objGetAllProduct.code = doc.data().code;
            objGetAllProduct.productname = doc.data().productname;
            objGetAllProduct.category = doc.data().category;
            objGetAllProduct.brandname = doc.data().brandname;
            objGetAllProduct.formulation = doc.data().formulation;
            objGetAllProduct.price = parseFloat(doc.data().price).toFixed(2);
            objGetAllProduct.stocks = doc.data().stocks;
            objGetAllProduct.unit = doc.data().unit;
            objGetAllProduct.expirationdate = doc.data().expirationdate;
            objGetAllProduct.image = doc.data().image;
            objGetAllProduct.prescription = doc.data().prescription;
            objGetAllProduct.status = doc.data().status;
            ArrayGetAllProduct.push(objGetAllProduct);
        });
    
        let now = new Date();
        let month = now.getMonth() + 1;
        let year = now.getFullYear();
        let pad = "00";
        let ctxt = "" + month;
        month = pad.substr(0, pad.length - ctxt.length) + ctxt;
        let month_year = `${month}/${year}`;
        
        let product_expired = 0;
        let product_outofstocks = 0;
        let product_lowstocks = 0;
        let array_category = [];
    
        const LoadrenderProductArray = (Acode,Aproductname,Acategory,Abrandname,Aformulation,Aprice,Aimage) => {
            let product_div = document.createElement('div');
            let prod_img = document.createElement('img'); 
            let prodname = document.createElement('p');
            let brandname = document.createElement('p');
            let formulation = document.createElement('p');
            let price = document.createElement('p');
            
            prodname.textContent = Aproductname;
            brandname.textContent = Abrandname;
            formulation.textContent = Aformulation;
            price.textContent = "P " + parseFloat(Aprice).toFixed(2);
            prod_img.src = Aimage;
            prod_img.width = "150";
            prod_img.height = "150";
            
            product_div.setAttribute('id', Acode);
            product_div.setAttribute('data-category', Acategory);
            product_div.setAttribute('data-productname', Aproductname);
            prod_img.setAttribute('class',"product-img");
            product_div.setAttribute('class', "product-item");
            prodname.setAttribute('class',"product-name");
            formulation.setAttribute('class',"product-formulation");
            price.setAttribute('class',"product-price");
            brandname.setAttribute('class',"product-brandname");
            
            product_div.appendChild(prod_img);
            product_div.appendChild(prodname);
            product_div.appendChild(brandname);
            product_div.appendChild(formulation);
            product_div.appendChild(price);
            $(".product-table").append(product_div);
            $("#product").append(product_div);
        }
        
        function LoadrenderCategory(data_category){
            let option = document.createElement('option');
            option.textContent = data_category;
            option.value = data_category;
            $(".category").append(option);
        }
        
        for(let i = 0; i < ArrayGetAllProduct.length; i++){
            let code = ArrayGetAllProduct[i].code;
            let productname = ArrayGetAllProduct[i].productname;
            let brandname = ArrayGetAllProduct[i].brandname;
            let formulation = ArrayGetAllProduct[i].formulation;
            let price = ArrayGetAllProduct[i].price;
            let image = ArrayGetAllProduct[i].image;
            let category = ArrayGetAllProduct[i].category;
    
            let existCategory = array_category.includes(category);
            !existCategory ? array_category.push(category) : null;
            LoadrenderProductArray(code,productname,category,brandname,formulation,price,image);
        }
        for(let a = 0; a < array_category.length; a++){
            LoadrenderCategory(array_category[a]);
        }
        
        try{
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": true,
                "progressBar": true,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "10000",
                "hideDuration": "10000",
                "timeOut": "10000",
                "extendedTimeOut": "10000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            }
            
            const UpdateArrayExpirationDate = (index,code) => {
                firestore.collection("Product").doc(code).update({expirationdate: "expired"});
                ArrayGetAllProduct[index].expirationdate = "expired";
            }
            for(let i = 0; i < ArrayGetAllProduct.length; i++){
                let code = ArrayGetAllProduct[i].code;
                let productname = ArrayGetAllProduct[i].productname;
                let category = ArrayGetAllProduct[i].category;
                let brandname = ArrayGetAllProduct[i].brandname;
                let formulation = ArrayGetAllProduct[i].formulation;
                let price = ArrayGetAllProduct[i].price;
                let stocks = ArrayGetAllProduct[i].stocks;
                let unit = ArrayGetAllProduct[i].unit;
                let expirationdate = ArrayGetAllProduct[i].expirationdate;
                
                //UPDATE EXPIRATION DATE
                expirationdate == month_year ? UpdateArrayExpirationDate(i,code) : null;
            
                //NOTIFICATION FOR EXPIRED,OUT OF STOCKS AND LOW IN STOCKS
                expirationdate == "expired" ? product_expired++ : null;
                parseInt(stocks) == 0 ? product_outofstocks++ : null;
                parseInt(stocks) <= 5 && parseInt(stocks) != 0 ? product_lowstocks++ : null;

                //DISPLAY PRODUCTLIST IN PRODUCT STOCK STATUS
                let tr = `<tr>
                            <td>${code}</td>
                            <td>${productname}</td>
                            <td>${category}</td>
                            <td>${brandname}</td>
                            <td>${formulation}</td>
                            <td style="text-align:center;">${parseFloat(price).toFixed(2)}</td>
                            <td style="text-align:center;">${stocks} ${unit}</td>
                        </tr>`;
                parseInt(stocks) != 0 ? $(".PSS-table").append(tr) : null;
            }
            
            product_expired != 0 ? toastr["warning"](`${product_expired} Products have been Expired`) : null;
            product_outofstocks != 0 ? toastr["warning"](`${product_outofstocks} Products are Out Of Stocks`) : null;
            product_lowstocks != 0 ? toastr["warning"](`${product_lowstocks} Products are Low In Stocks`) : null;

            $(".PSS-expired").text(product_expired);
            $(".PSS-low_stocks").text(product_lowstocks);
            $(".PSS-out_stocks").text(product_outofstocks);    
        }
        catch{}
    });


    firestore.collection("PullOutProduct").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let obj = {};
            obj.code = doc.data().code;
            obj.productname = doc.data().productname;
            obj.category = doc.data().category;
            obj.brandname = doc.data().brandname;
            obj.formulation = doc.data().formulation;
            obj.price = parseFloat(doc.data().price).toFixed(2);
            obj.stocks = doc.data().stocks;
            obj.unit = doc.data().unit;
            obj.expirationdate = doc.data().expirationdate;
            obj.image = doc.data().image;
            obj.prescription = doc.data().prescription;
            obj.status = doc.data().status;
            ArrayGetAllPullOutProduct.push(obj);
        });

        for(let i = 0; i < ArrayGetAllPullOutProduct.length; i++){
            let code = ArrayGetAllPullOutProduct[i].code;
            let productname = ArrayGetAllPullOutProduct[i].productname;
            let category = ArrayGetAllPullOutProduct[i].category;
            let brandname = ArrayGetAllPullOutProduct[i].brandname;
            let formulation = ArrayGetAllPullOutProduct[i].formulation;
            let price = ArrayGetAllPullOutProduct[i].price;

            let td = `<tr>
                        <td>${code}</td>
                        <td>${productname}</td>
                        <td>${category}</td>
                        <td>${brandname}</td>
                        <td>${formulation}</td>
                        <td>${price}</td>
                    </tr>`
            $(".PPH-table").append(td);
        }
    });
}
catch{
    console.log("CAN'T CONNECT TO FIREBASE FIRESTORE");
}



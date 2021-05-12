$(".SIE-viewtablebtn").click(() => {
  $(".SIE-enterproduct").css("display", "none");
  $(".SIE-producttable").css("display", "flex");
});
$(".SIE-backbtn").click(() => {
  $(".SIE-enterproduct").css("display", "flex");
  $(".SIE-producttable").css("display", "none");
});

//RENDER SEARCH PRODUCT-----------------------------------------------------------------------------------------
const product_info = $(".SIE-product");
const render_searchproduct = (doc) => {
  let product_div = document.createElement("div");
  let prod_img = document.createElement("img");
  let prodname = document.createElement("p");
  let brandname = document.createElement("p");
  let formulation = document.createElement("p");
  let price = document.createElement("p");
  let stocks = document.createElement("p");

  prodname.textContent = doc.data().productname;
  brandname.textContent = doc.data().brandname;
  formulation.textContent = doc.data().formulation;
  price.textContent = "P " + parseFloat(doc.data().price).toFixed(2);
  prod_img.src = doc.data().image;
  prod_img.width = "80";
  prod_img.height = "80";
  stocks.textContent = `Available Stocks: ${doc.data().stocks}`;

  prod_img.setAttribute("class", "SIE-product-img");
  product_div.setAttribute("class", "SIE-product-item");
  product_div.setAttribute("data-code", doc.data().code);
  prodname.setAttribute("class", "SIE-product-name");
  formulation.setAttribute("class", "SIE-product-formulation");
  price.setAttribute("class", "SIE-product-price");
  brandname.setAttribute("class", "SIE-product-brandname");
  stocks.setAttribute("class", "SIE-product-stocks");
  product_div.appendChild(prod_img);
  product_div.appendChild(prodname);
  product_div.appendChild(brandname);
  product_div.appendChild(formulation);
  product_div.appendChild(price);
  product_div.appendChild(stocks);
  product_info.append(product_div);
};

//FUNCTION FOR STOCK IN ENTRY-----------------------------------------------------------------------------------
const search = $(".SIE-search");
const savebtn = $(".SIE-savebtn");
const cancelbtn = $(".SIE-cancelbtn");
const total_stocks = $(".SIE-total_stock");
const product_table = $(".SIE-product_table");
let product_array = [];
let productitem_array = [];

//AUTOCOMPLETE EVENT SEARCH PRODUCT-----------------------------------------------------------------------------
firestore
  .collection("Product")
  .get()
  .then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      product_array.push(doc.data().productname);
      product_array.push(doc.data().code);
      search.autocomplete({
        source: product_array,
        autoFocus: true,
        classes: {
          "ui-autocomplete": "highlight",
        },
      });
    });
  });

//EVENTLISTENER FOR SEARCHBOX KEYUP----------------------------------------------------------------------------------------------------------
const searchproduct = (searchdata) => {
  try {
    const capSearch = (str) =>
      str[0].toUpperCase() + str.slice(1).toLowerCase();
    let words = searchdata.split(" ").map(capSearch);
    searchdata = words.join(" ");
  } catch {}

  firestore
    .collection("Product")
    .where("productname", "==", `${searchdata}`)
    .where("expirationdate", "!=", "expired")
    .get()
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        product_info.empty();
        render_searchproduct(doc);
      });
    });

  firestore
    .collection("Product")
    .where("code", "==", `${searchdata}`)
    .where("expirationdate", "!=", "expired")
    .get()
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        product_info.empty();
        render_searchproduct(doc);
      });
    });
};
search.keyup((e) => {
  let searchdata = e.target.value;
  product_info.empty();
  searchdata.length == 0 ? product_info.empty() : searchproduct(searchdata);
});

//ENTER KEYPRESSED FOR SEARCHBOX--------------------------------------------------------------------------------
search.keypress((e) => {
  let total_stock = $(".SIE-total_stock");
  let date_received = $(".SIE-date_received").val();
  let year = date_received.substr(0, 4);
  let month = date_received.substr(5, 2);
  let date = date_received.substr(8, 2);
  let product_item = document.querySelector(".SIE-product-item");
  let code = "";
  date_received = `${month}/${date}/${year}`;

  const productsearch = () => {
    try {
      code = product_item.dataset.code;
      let obj = {};
      let productref = firestore.collection("Product").doc(code);
      productref.get().then((doc) => {
        if (doc.exists) {
          obj.code = doc.data().code;
          obj.productname = doc.data().productname;
          obj.category = doc.data().category;
          obj.brandname = doc.data().brandname;
          obj.expirationdate = doc.data().expirationdate;
          obj.formulation = doc.data().formulation;
          obj.datereceived = date_received;
          swal({
            content: {
              element: "input",
              attributes: {
                placeholder: "Enter Stock",
                type: "number",
              },
            },
          }).then((value) => {
            const add_stock = () => {
              let total_added_stocks = parseInt(total_stock.text());
              let stocks_enter = parseInt(value);
              obj.new_stocks = stocks_enter + doc.data().stocks;
              obj.stock = stocks_enter;

              try {
                for (let i = 0; i <= productitem_array.length; i++) {
                  if (productitem_array[i].code == doc.data().code) {
                    obj.stock = productitem_array[i].stock + stocks_enter;
                    obj.new_stocks = obj.stock + doc.data().stocks;
                    productitem_array.splice(i, 1);
                  }
                }
              } catch {}

              total_added_stocks = total_added_stocks + stocks_enter;
              total_stock.text(total_added_stocks);
              productitem_array.push(obj);
              product_info.empty();
              search.val("");
              search.focus();
              let tr = `<tr class="SIE-product-${obj.code}">
                        <td>${obj.code}</td>
                        <td>${obj.productname}</td>
                        <td>${obj.category}</td>
                        <td>${obj.brandname}</td>
                        <td>${obj.stock}</td>
                        <td><button style="color: maroon; width: 2.5rem; height: 2.5rem;padding: 5px;
                        border-radius: 8px;
                        box-shadow: 0px 3px 6px rgb(0 0 0 / 25%);
                        background: #b7dbed;
                        outline: none;
                        border-color: #b7dbed;" class="fas fa-trash fa-lg" id="${obj.code}"></button></td>
                        </tr>`;

              try {
                for (let i = 0; i <= productitem_array.length; i++) {
                  if (productitem_array[i].code == doc.data().code) {
                    $(`.SIE-product-${obj.code}`).remove();
                  }
                }
              } catch {}
              product_table.append(tr);
            };

            value == null || value == 0 ? null : add_stock();
          });
        }
      });
    } catch {
      swal("", "Product Not Found", "error");
    }
  };

  e.keyCode == "13"
    ? date_received == "//"
      ? swal("", "SET DATE RECEIVED", "warning")
      : productsearch()
    : null;
});

//REMOVE PRODUCT FROM STOCK IN ENTRY TABLE------------------------------------------------------------------------
product_table.click((e) => {
  let code = e.target.id;
  let productname = "";
  let remove_total_stocks = parseInt(total_stocks.text());
  try {
    for (let i = 0; i <= productitem_array.length; i++) {
      if (productitem_array[i].code == code) {
        productname = productitem_array[i].productname;
        remove_total_stocks =
          remove_total_stocks - parseInt(productitem_array[i].stock);
        swal({
          title: "",
          text: `Are you sure you want to remove ${productname} in Stock In Entry?`,
          icon: "warning",
          buttons: ["No", "Yes"],
          dangerMode: true,
        }).then((willDelete) => {
          if (willDelete) {
            total_stocks.text(`${remove_total_stocks}`);
            $(`.SIE-product-${code}`).remove();
            productitem_array.splice(i, 1);
            swal(
              "",
              `${productname} was successfully remove from Stock In Entry`,
              "success"
            );
          }
        });
      }
    }
  } catch {}
});

//RESET COMPONENTS-----------------------------------------------------------------------------------------------
const SIE_reset_components = () => {
  productitem_array.length = 0;
  total_stocks.text("0");
  $(".SIE-date_received").val("");
  search.val("");
  search.focus();
  product_info.empty();
  product_table.empty();
  let tr = `<tr>
  <th>Code</th>
  <th>Product Name</th>
  <th>Category</th>
  <th>Brand Name</th>
  <th>Stock</th>
  <th>Button</th>
</tr>`;
  product_table.append(tr);
};
//CLICK EVENT FOR SAVE STOCK IN ENTRY----------------------------------------------------------------------------
savebtn.click(() => {
  const save_stockin = () => {
    for (let i = 0; i < productitem_array.length; i++) {
      let code = productitem_array[i].code;
      let stock = productitem_array[i].new_stocks;
      firestore.collection("Product").doc(code).update({
        stocks: stock,
      });
    }
    SIE_reset_components();
    swal("", "Stock In Entry successfully saved.", "success");
  };

  productitem_array.length == 0
    ? swal("", "Stock In Entry is empty.", "error")
    : save_stockin();
});

//CLICK EVENT FOR CANCEL STOCK IN ENTRY---------------------------------------------------------------------------
cancelbtn.click(() => {
  productitem_array.length == 0
    ? swal("", "Stock In Entry is empty.", "error")
    : swal({
        title: "",
        text: `Are you sure you want to cancel this Stock In Entry?`,
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          SIE_reset_components();
          swal("", "Stock In Entry was successfully canceled", "success");
        }
      });
});

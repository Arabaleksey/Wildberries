import 'bootstrap/js/dist/carousel';

const rowList = document.getElementById('row')
const search = document.getElementById('search')
const openCartBtn = document.getElementById("cart");
const openCartPic = document.getElementById("cart-pic");
const closeCart = document.getElementById("modal-close");
const modalCart = document.getElementById("modal-cart");
const modalPic = document.getElementById("modal-pic");
const closePic = document.getElementById("modal-pic-close");
const modalPicWrapper = document.getElementById('modal-pic__wrapper-img')
const cartWrapper = document.getElementById('modal-cart__list')
const clearCart = document.getElementById('modal-cart__clear')
const totalPrice = document.getElementById('modal-cart__total')
const preloader = document.getElementById("preloader")
const cardCount = document.getElementById("header__cart-pic_count")



let cardValues = 0;
let cardId = {};
cardCount.innerText = '0';

openCartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    modalCart.classList.add('open-cart');
    renderCart()
})

openCartPic.addEventListener('click', (e) => {
    e.preventDefault();
    modalCart.classList.add('open-cart');
})

closeCart.addEventListener('click', () => {
    modalCart.classList.remove('open-cart');
})

window.addEventListener('click', (e) => {
    if (e.target == modalCart) {
        modalCart.classList.remove('open-cart');
    }
    if (e.target == modalPic) {
        modalPic.classList.remove('open-pic');
    }
})

closePic.addEventListener('click', () => {
    modalPic.classList.remove('open-pic');
})



//Добавление товаров в КОРЗИНУ
function moveToCart(data){
    if(localStorage.getItem('cartList')){
        cardId = JSON.parse(localStorage.getItem('cartList'))
    } else {
        cardId = {};
    }

    if(cardId[data.id]){
        cardId[data.id] +=1;
    } else{
        cardId[data.id]=1;
    }
    localStorage.setItem('cartList', JSON.stringify(cardId))  
    cardValues = Object.values(JSON.parse(localStorage.getItem('cartList'))).reduce((el,calc)=>
        el+calc,0
    )
    localStorage.setItem('cardCount',JSON.stringify(cardValues))
    cardCount.innerText = cardValues;

}
 
if(localStorage.getItem('cardCount')){
    cardCount.innerText = JSON.parse(localStorage.getItem('cardCount'))
} else {
    cardCount.innerText = '0';
}

//РЕНДЕРИНГ КАРТОЧЕК
async function renderCart(){
    cardId = JSON.parse(localStorage.getItem('cartList'));
    let price = 0;

    if(cardId){
    let c = Object.keys(cardId);
    cartWrapper.innerHTML = '';
    let displayItems = '';
    Promise.all(c.map(el=>fetch(`https://63a9d787594f75dc1dc20983.mockapi.io/api/wildberries/v1/WB/${el}`)
    .then(responses=>responses.json())))
        .then(data =>{
                data.forEach(function(el){
                    if(data){
                    displayItems=`
                        <li class="modal-cart__item" >
                            <div class="modal-cart__item_wrap-img">
                                <img class = "modal-cart__item_image" src="${el.url}" alt="image">
                            </div>
                        <p class="modal-cart__item_title">${el.title}</p>
                            <div class="modal-cart__item_wrap-price">
                                <p class="modal-cart__item_count">${cardId[el.id]}</p>
                                <p class="modal-cart__item_mult">x</p>
                                <p class="modal-cart__item_price">${el.truePrice} руб.</p>
                            </div>
                        </li>
                    `;
                    cartWrapper.insertAdjacentHTML("afterbegin", displayItems);
                    price += (el.truePrice*cardId[el.id]);
                    totalPrice.innerText = price;
                    }

                })      
        })
    } else {

                        displayItems = `
                        <li class="modal-cart__empty-item">Корзина пуста...</li>
                        `     
                        cartWrapper.insertAdjacentHTML("afterbegin", displayItems)
                    
    }

   

}
    
clearCart.addEventListener('click',()=>{
    localStorage.removeItem('cartList')
    localStorage.removeItem('cardCount')
    cartWrapper.innerHTML='';  
    totalPrice.innerText = '0';     
    cardCount.innerText = '0';
    cardId={};
    renderCart();
})


//ПОИСК ЭЛЕМЕНТОВ ЧЕРЕЗ INPUT
function filterCards(a) {
        search.addEventListener("input", (e)=>{
            rowList.innerHTML='';
            let filterArr = [];
            filterArr = a.filter((el)=>{
                return el.title.toLowerCase().includes(e.target.value.toLowerCase())
            })
            if(search.value === ''){
                renderCards(a)
            } else{
                renderCards(filterArr)
            }            
        })
}
filterCards()




//ПОЛУЧЕНИЕ КАРТОЧЕК С mockApi
async function getCards() {
    let responce = await fetch('https://63a9d787594f75dc1dc20983.mockapi.io/api/wildberries/v1/WB')
    return  await responce.json()
        .then(function(el){
            preloader.style.opacity = "0";
            preloader.style.visibility = "hidden";
            let a = el;
            console.log(a)
            renderCards(el)
            filterCards(a)
        })

}
getCards()

//РЕНДЕРИНГ КАРТОЧЕК
function renderCards(data){
    let displayCard = '';
    data.forEach(function (item){
    displayCard = `
    <div class="popular__card" id="${item.id}">
    <div class="popular__img">
        <img class="popular__image" src="${item.url}" alt="image">
        <div class="popular__enlarge-img" id="enlarge-img">
            <img src="./src/img/enlarge.png" alt="enlarge">
        </div>
    </div>
    <div class="popular__top">
        <div class="popular_wrap">
            <h2 class="popular__card-title">${item.title}</h2>
            <p class="popular__price">${item.truePrice} руб.</p>
        </div>
        <div class="popular__perc-discount">-10%</div>
    </div>
    <div class="popular__bottom">
        <p class="popular__old-price">${item.falsePrice} руб.</p>
        <button class="popular__card-btn btn" id="${item.id}">В корзину</button>
    </div>
</div>
`;

    rowList.insertAdjacentHTML("afterbegin", displayCard);

    const enlargePic = document.getElementById("enlarge-img");
    enlargePic.addEventListener('click', (e) => {
        e.preventDefault();
        modalPic.classList.add('open-pic');
        modalPicWrapper.innerHTML=`
        <img src="${item.url}" alt="" class="modal-pic__img">
        `
    })

    //КЛИК НА КНОПКУ "Добавить в корзину"
    rowList
        .querySelector(`button[id="${item.id}"]`)
        .addEventListener('click', () => moveToCart(item))


    // //КЛИК НА КНОПКУ "Добавить в корзину"
    // rowList  
    //     .querySelector(`button[data-id="${item.id}"]`)
    //     .addEventListener("click", () => moveToBasket(item));

    // //КЛИК НА КНОПКУ "Quick view"
    // rowList  
    //     .querySelector(`button[id="img_${item.id}"]`)
    //     .addEventListener("click", () => openModalPicture(item.id))

})
}


import './sass/main.scss';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
const axios = require('axios');
// ===================================================================================

const BASE_URL = "https://pixabay.com/api/";
const key = "25084920-0e8ebadd3b3d898ff3835027a";



const input = document.querySelector("input");
const form = document.querySelector(".search-form");
const gallery = document.querySelector(".gallery");
const loadMoreButton = document.querySelector(".load-more");
const formButton = document.querySelector(".btn");
console.log(formButton);

let page = 1;
let per_page = 40;

async function fetcher(request) {
    try {
        const resp = await axios.get(`${BASE_URL}?key=${key}&q=${request}&image_type=photo&orientation=horizontal&per_page=${per_page}&safesearch=true&page=${page}`);
        return await resp.data;
    } catch (error) {
        console.log(error);
    }
}

 async function render(data) {
    try {
        const markup = await data.hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
            return `<a class="card-link" href="${largeImageURL}">
      <div class="photo-card">
      <div class="thumb">
        <img class="photo" src="${webformatURL}" alt="${tags}"  loading="lazy" />
      </div>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            ${likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${views}
          </p>
          <p class="info-item">
            <b>Comments</b>
            ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${downloads}
          </p>
        </div>
      </div>
      </a>`
    }).join("");
        await gallery.insertAdjacentHTML("beforeend", markup);
            let simpleLB = new SimpleLightbox('.gallery a');
            simpleLB.on('show.simplelightbox');
      
    } catch (error) {
        console.log(error);
    }
}

async function onSearch(event) {
  event.preventDefault();
  formButton.disabled = true;

  if (loadMoreButton) {
    loadMoreButton.classList.remove("enabledBtn");
  }
    page = 1;
    if (input.value.trim() === "") {
        Notiflix.Notify.warning("Enter your request correctly, please");
        return;
    }
    gallery.innerHTML = ""
    event.preventDefault();
    await fetcher(input.value).then(data => {
        if (data.totalHits == 0) {
            Notiflix.Notify.failure("No pictures for your request, try again");
            input.value = "";
            return;
        }
        Notiflix.Notify.success(`we find ${data.totalHits} pictures`);
        return data

    }).then(data => {
      if (data.hits.length === per_page) {
        loadMoreButton.classList.remove("disabledBtn");
        loadMoreButton.classList.add("enabledBtn");
      }
      render(data);
      
    });
    formButton.disabled = false;
  
  
  
  
}

async function loadMore() {
  loadMoreButton.disabled = true;
    page += 1; 
    const fetch = await fetcher(input.value);
    let simpleLB = new SimpleLightbox('.gallery a');
    simpleLB.refresh()
  await render(fetch);
  loadMoreButton.disabled = false;
  if (fetch.hits.length < per_page) {
    Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.")
    loadMoreButton.classList.remove("enabledBtn");
    loadMoreButton.classList.add("disabledBtn");
  }

}


form.addEventListener("submit", onSearch)

loadMoreButton.addEventListener("click", loadMore)

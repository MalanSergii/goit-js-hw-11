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
  if (loadMoreButton) {
    hideLoadMoreButton();
  }
    page = 1;
    if (input.value.trim() === "") {
        Notiflix.Notify.warning("Enter your request correctly, please");
        return;
    }
    formButton.classList.add("disabledBtn");
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
        showLoadMoreButton();
      }
      render(data);
      
    });
  formButton.classList.remove("disabledBtn");
}

async function loadMore() {
  await hideLoadMoreButton();
  page += 1; 
  const fetch = await fetcher(input.value);
  let simpleLB = new SimpleLightbox('.gallery a');
  simpleLB.refresh();
  await render(fetch);
  if (fetch.hits.length < per_page) {
    Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.")
    await hideLoadMoreButton();
    return;
  }
  showLoadMoreButton();
}

function hideLoadMoreButton() {
  loadMoreButton.classList.remove("enabledBtn");
  loadMoreButton.classList.add("disabledBtn");
}

function showLoadMoreButton() {
  loadMoreButton.classList.remove("disabledBtn");
  loadMoreButton.classList.add("enabledBtn");
}

form.addEventListener("submit", onSearch)

loadMoreButton.addEventListener("click", loadMore)

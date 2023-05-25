const playPauseBtn = document.querySelector(".play-pause-btn")//icones pego no svg usando class com querySelector
const theaterBtn = document.querySelector(".theater-btn")//tamanho tela teatro média
const fullScreenBtn = document.querySelector(".full-screen-btn")//maior maxima
const miniPlayerBtn = document.querySelector(".mini-player-btn")//menor tela
const muteBtn = document.querySelector(".mute-btn")
const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")//velocidade de video selecionado
const currentTimeElem = document.querySelector(".current-time")//tempo geral de duração
const totalTimeElem = document.querySelector(".total-time")//tempo total
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const volumeSlider = document.querySelector(".volume-slider")
const videoContainer = document.querySelector(".video-container")//div q cobre toda a aplicação
const timelineContainer = document.querySelector(".timeline-container")
const video = document.querySelector("video")//video em si pego pelo html<video></video>

document.addEventListener("keydown", e => {//evento para rodar o video e outros com interaçoes do teclado
  const tagName = document.activeElement.tagName.toLowerCase() //para caso de estar em comentario usando os digitos

  if (tagName === "input") return //no caso se for igual a input o teclado nao tera efeito no video

  switch (e.key.toLowerCase()) {//toLowerCase apenas funciona com letra minuscula
    case " ":// case " " representa space click do teclado
      if (tagName === "button") return //se for um botão fora do video tbm nao retorna nada
    case "k":
      togglePlay()//função play e pause para rodar o video
      break
    case "f":
      toggleFullScreenMode()//tela cheia clicando na tecla f
      break
    case "t":
      toggleTheaterMode()//tamanho teatro
      break
    case "i":
      toggleMiniPlayerMode()//tamanho mini
      break
    case "m":
      toggleMute()//mutar e desmutar ao clicar tecla m
      break
    case "arrowleft"://volta 5 segundos de video
    case "j":
      skip(-5)
      break
    case "arrowright":
    case "l":
      skip(5)
      break
    case "c":
      toggleCaptions()
      break
  }
})

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate)/*movimento do mouse */
timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1/*e.buttons & 1 equivale a botão esquerdo do mouse */
  videoContainer.classList.toggle("scrubbing", isScrubbing)/*botão esquerdo do mouse sendo usado */
  if (isScrubbing) {
    wasPaused = video.paused /*pausa o video se clicar com mouse na linha de video */
    video.pause()
  } else {
    video.currentTime = percent * video.duration/*video correndo recebe percentual onde parou enquanto usava mouse */
    if (!wasPaused) video.play()/*video começa a rodar novamente */
  }

  handleTimelineUpdate(e)/* atualizar timeline */
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 1)/*de um em um segundo mostra os preview */
  )
  const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`/*local da imagem conectada com os segundos q sera usada */
  previewImg.src = previewImgSrc
  timelineContainer.style.setProperty("--preview-position", percent)//--preview-position pego no css em um calc

  if (isScrubbing) {/*se esta rolando mouse */
    e.preventDefault()
    thumbnailImg.src = previewImgSrc
    timelineContainer.style.setProperty("--progress-position", percent)/*posição de progresso para fazer calc no css */
  }
}

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed)

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25//aumentar +25 velocidade,,.playbackRate:fator velocidade do video js
  if (newPlaybackRate > 2) newPlaybackRate = 0.25//se for maior que 2 volta a 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
}

// Captions //logica nao funcionou????
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)

function toggleCaptions() {
  const isHidden = captions.mode === "hidden"
  captions.mode = isHidden ? "showing" : "hidden"
  videoContainer.classList.toggle("captions", isHidden)
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration)//tempo total receberá função duração tempo
})

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime)//incluir na função tempo corrido
  const percent = video.currentTime / video.duration //divide currentTime tempo corrido com duração de video total
  timelineContainer.style.setProperty("--progress-position", percent)// || 00:08
})

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {//formatador zero
  minimumIntegerDigits: 2,
})
function formatDuration(time) {
  const seconds = Math.floor(time % 60)//60 segundos
  const minutes = Math.floor(time / 60) % 60//
  const hours = Math.floor(time / 3600)//segundos em hora equivale 3600
  if (minutes === 0) {//se minutos 0
    return `00:${leadingZeroFormatter.format(seconds)}` //retorna segundos
  }
  else if (hours === 0) {//se tiver zero horas 
    return `${minutes}:${leadingZeroFormatter.format(seconds)}` //retorna minutos e segundos
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`//inclui as horas
  }
}

function skip(duration) {//pula a duração do video em 5 segundos
  video.currentTime += duration
}

// Volume
muteBtn.addEventListener("click", toggleMute)//pega muteBtn query selector e add click
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value //o target de valor recebe volume 
  video.muted = e.target.value === 0 //se estiver a zero volume fica mutado
})

function toggleMute() {
  video.muted = !video.muted //video no mudo = inverso disso ao clicar no botão
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume
  let volumeLevel //volume alto ou baixo
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0 //fica mutado volume
    volumeLevel = "muted"
  } else if (video.volume >= 0.5) {//se for maior ou igual a 0.5 fica volume alto
    volumeLevel = "high"
  } else {//se não baixo
    volumeLevel = "low"
  }

  videoContainer.dataset.volumeLevel = volumeLevel //Dataset:é um recurso muito interessante, permite que adicionemos dados a elementos HMTL, como se fossem constantes
})

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode)
fullScreenBtn.addEventListener("click", toggleFullScreenMode)//evento de click dos tamanhos de tela
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater")//toggle:clique alternancia on e off tamanho médio de tela
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {//se a tela cheia for igual nulo
    videoContainer.requestFullscreen()//videoContainer div q cobre tudo,  O método requestFullscreen () abre um elemento no modo tela cheia
  } else {
    document.exitFullscreen()//exitFullscreen () cancela um elemento no modo de tela cheia metodo js.
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture()//metodo de miniplayer do js para retornar ao player normal
  } else {
    video.requestPictureInPicture()//aciona o miniplayer
  }
}

document.addEventListener("fullscreenchange", () => {//esse metodo nao serviu pra nada
  videoContainer.classList.toggle("full-screen", document.fullscreenElement)//mas seria para mostra se esta nulo ou nao o tela cheia
})

video.addEventListener("enterpictureinpicture", () => {//evento enterpictureinpicture é disparado quando o HTMLVideoElement entra no modo picture-in-picture com sucesso.
  videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {//evento leavepictureinpicture é disparado quando o HTMLVideoElement sai do modo picture-in-picture com sucesso.
  videoContainer.classList.remove("mini-player")//remover o mini player de acordo com exitPictureInPicture
})

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay)//gera evento de click com addEventListener com a função togglePlay
video.addEventListener("click", togglePlay)

function togglePlay() {
  video.paused ? video.play() : video.pause()//se estirver 'paused uma class' aciona metodo play video se não pause
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused")//remove o paused de class="video-container paused" ao clicar play
})

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused")
})


// const subtitles = document.getElementById("subtitles");

// for (let i = 0; i < video.textTracks.length; i++) {
//   video.textTracks[i].mode = "hidden";
// }

// let subtitlesMenu;
// if (video.textTracks) {
//   const df = document.createDocumentFragment();
//   const subtitlesMenu = df.appendChild(document.createElement("ul"));
//   subtitlesMenu.className = "subtitles-menu";
//   subtitlesMenu.appendChild(createMenuItem("subtitles-off", "", "Off"));
//   for (let i = 0; i < video.textTracks.length; i++) {
//     subtitlesMenu.appendChild(
//       createMenuItem(
//         `subtitles-${video.textTracks[i].language}`,
//         video.textTracks[i].language,
//         video.textTracks[i].label
//       )
//     );
//   }
//   videoContainer.appendChild(subtitlesMenu);
// }

// const subtitleMenuButtons = [];
// function createMenuItem(id, lang, label) {
//   const listItem = document.createElement("li");
//   const button = listItem.appendChild(document.createElement("button"));
//   button.setAttribute("id", id);
//   button.className = "subtitles-button";
//   if (lang.length > 0) button.setAttribute("lang", lang);
//   button.value = label;
//   button.setAttribute("data-state", "inactive");
//   button.appendChild(document.createTextNode(label));
//   button.addEventListener("click", (e) => {
//     // Set all buttons to inactive
//     subtitleMenuButtons.forEach((button) => {
//       button.setAttribute("data-state", "inactive");
//     });

//     // Find the language to activate
//     const lang = button.getAttribute("lang");
//     for (let i = 0; i < video.textTracks.length; i++) {
//       // For the 'subtitles-off' button, the first condition will never match so all will subtitles be turned off
//       if (video.textTracks[i].language === lang) {
//         video.textTracks[i].mode = "showing";
//         button.setAttribute("data-state", "active");
//       } else {
//         video.textTracks[i].mode = "hidden";
//       }
//     }
//     subtitlesMenu.style.display = "none";
//   });
//   subtitleMenuButtons.push(button);
//   return listItem;
// }

// subtitles.addEventListener("click", (e) => {
//   if (subtitlesMenu) {
//     subtitlesMenu.style.display =
//       subtitlesMenu.style.display === "block" ? "none" : "block";
//   }
// });
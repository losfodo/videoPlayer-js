import { Button, Flex, Spinner } from "@chakra-ui/react";
import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import PlayIcon from "./PlayIcon";
import PauseIcon from "./PauseIcon";
import ElapsedTimeTracker from "./ElapsedTimeTracker";
import PlaybackRate from "./PlaybackRate";

const Video = styled.video`
  flex-shrink: 1;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
`;

interface Props {
  src: string;
  muted?: boolean;
  autoPlay?: boolean;
}

const Player = (props: Props) => {
  const { src, autoPlay, muted } = props;
  const [isWaiting, setIsWaiting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);//estado de play rodar o video
  const [playbackRate, setPlaybackRate] = useState(1);
  const [durationSec, setDurationSec] = useState(1);
  const [elapsedSec, setElapsedSec] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const onWaiting = () => {
      if (isPlaying) setIsPlaying(false);
      setIsWaiting(true);
    };

    const onPlay = () => {// metodo no useEffect para video rodar
      if (isWaiting) setIsWaiting(false);
      setIsPlaying(true);
    };

    const onPause = () => {//logica pause
      setIsPlaying(false);
      setIsWaiting(false);
    };

    const element = videoRef.current;//video curret referencia elemento

    const onProgress = () => {//Progresso de carregamento do vídeo enquanto carrega
      if (!element.buffered || !bufferRef.current) return;
      if (!element.buffered.length) return;
      const bufferedEnd = element.buffered.end(element.buffered.length - 1);
      const duration = element.duration;
      if (bufferRef && duration > 0) {
        bufferRef.current.style.width = (bufferedEnd / duration) * 100 + "%";
      }
    };

    const onTimeUpdate = () => {//Obter a hora atual e a duração. gerar a barra da timeline
      setIsWaiting(false);
      if (!element.buffered || !progressRef.current) return;
      const duration = element.duration;
      setDurationSec(duration);//estado com tempo funcionar 00:
      setElapsedSec(element.currentTime);//estado em segundos funcionar __:00
      if (progressRef && duration > 0) {
        progressRef.current.style.width =
          (element.currentTime / duration) * 100 + "%";
      }
    };

    element.addEventListener("progress", onProgress);
    element.addEventListener("timeupdate", onTimeUpdate);

    element.addEventListener("waiting", onWaiting);
    element.addEventListener("play", onPlay);//video funcionar
    element.addEventListener("playing", onPlay);
    element.addEventListener("pause", onPause);//Coloca pra ouvir o pause usando use effect.

    // clean up,,
    return () => {
      element.removeEventListener("waiting", onWaiting);
      element.removeEventListener("play", onPlay);
      element.removeEventListener("playing", onPlay);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("progress", onProgress);
      element.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [videoRef.current]);

  // This is where the playback rate is set on the video element.
  useEffect(() => {
    if (!videoRef.current) return;//retorna nada
    if (videoRef.current.playbackRate === playbackRate) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);//velocidade de video

  const handlePlayPauseClick = () => {//logica de tocar video
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();//Se estiver tocando gera o pause
      } else {
        videoRef.current.play();//se não play
      }
    }
  };

  const seekToPosition = (pos: number) => {//logica de clicar na barra de video e se manter corretamente rodando extamente onde clicou
    if (!videoRef.current) return;
    if (pos < 0 || pos > 1) return;//checa se o clique nao esta menor ou maior q 0

    const durationMs = videoRef.current.duration * 1000 || 0;

    const newElapsedMs = durationMs * pos;//pos:posição clicada
    const newTimeSec = newElapsedMs / 1000;
    videoRef.current.currentTime = newTimeSec;
  };

  return (
    <Flex
      flexDir="column"
      cursor="pointer"
      align="center"
      justify="center"
      pos="relative"
      rounded="10px"
      overflow="hidden"
      _hover={{
        ".timeline-container": {
          opacity: 1,
        },
      }}
    >
      {isWaiting && <Spinner pos="absolute" color="white" />}{/*isWaiting simula que esta carregando os dados*/}
      <Video
        autoPlay={autoPlay}
        muted={muted}
        src={src}
        onClick={handlePlayPauseClick}
        ref={videoRef}
      />{/*video em si*/}
      <Flex
        w="full"
        h="100px"
        bg="linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))"
        pos="absolute"
        opacity={0}
        transition="opacity 0.5s linear"
        className="timeline-container"
        left={0}
        bottom={0}
        align="flex-end"
        px="1rem"
      >{/*flex q cobre todos os controles*/}
        <Flex flexDir="column" w="full" align="center">{/*tbm cobre todos os controles,,column para ficar alinhado a um video */}
          <Flex
            w="full"
            transition="height 0.1s linear"
            className="timeline"
            h="4px"
            mb="0.5rem"
            rounded="10px"
            bg="rgba(193, 193, 193, 0.5)"
            _hover={{ height: "5px" }}
            overflow="hidden"
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();//getBoundingClientRect () retorna um objeto DOMRect fornecendo informações sobre o tamanho de um elemento e sua posição relativa
              const clickedPos = (e.clientX - left) / width;
              seekToPosition(clickedPos);
            }}
          >{/*timeline do video, seekToPosition(clickedPos) posição da linha do tempo clicada*/}
            <Flex pos="relative" w="full" h="full">
              <Flex
                h="full"
                className="play-progress"
                bg="#0CAADC"
                zIndex={1}
                ref={progressRef}
              />{/*Obter a hora atual e a duração. gerar a barra da timeline*/}
              <Flex
                pos="absolute"
                h="full"
                className="buffer-progress"
                bg="#FDFFFC"
                ref={bufferRef}
              />{/*Progresso de carregamento do vídeo enquanto carrega barra q mostra oq já foi carregado para ver*/}
            </Flex>
          </Flex>
          <Flex w="full" justify="space-between" align="center">
            <Flex align="center">
              <Button
                maxW="25px"
                minW="25px"
                w="25px"
                p="0"
                mr="0.4rem"
                maxH="25px"
                h="25px"
                rounded="4px"
                colorScheme="transparent"
                bg="transparent"
                mb="0.5rem"
                _hover={{
                  bg: "rgba(0, 0, 0, 0.4)",
                }}
                onClick={handlePlayPauseClick}
              >
                {!isPlaying ? <PlayIcon /> : <PauseIcon />}
              </Button>{/*botão play e pause em si q alterna os icones*/}

              <ElapsedTimeTracker
                totalSec={durationSec}
                elapsedSec={elapsedSec}
              />{/*tempo em numeros 00:00*/}
            </Flex>

            <PlaybackRate
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
            />{/*aumentar a velocidade de reprodução de video*/}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Player;

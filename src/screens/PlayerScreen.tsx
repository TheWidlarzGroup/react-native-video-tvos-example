import React, {useRef, useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  useTVEventHandler,
  TVFocusGuideView,
  Text,
  Pressable,
  Platform,
  HWEvent,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackNavParamList, useAppNavigation} from '../AppNavigator.tsx';
import {GoPreviousSvg} from '../../assets/GoPreviousSvg.tsx';
import {PauseSvg} from '../../assets/PauseSvg.tsx';
import {PlaySvg} from '../../assets/PlaySvg.tsx';
import {CustomPressable} from '../components/CustomPressable.tsx';
import {RFPercentage} from 'react-native-responsive-fontsize';

const {width} = Dimensions.get('window');

const sliderWidth = width * 0.9;
const thumbWidth = 20;

const seekTime = 5;
const longSeekTime = 15;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerScreen = ({
  route,
}: NativeStackScreenProps<AppStackNavParamList, 'PlayerScreen'>) => {
  const navigation = useAppNavigation();

  const {videoSource} = route.params;

  const videoRef = useRef<VideoRef>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [previewTime, setPreviewTime] = useState(0);
  const [keyPressed, setKeyPressed] = useState(false);

  const controlsOpenTimer = useCallback(() => {
    setControlsVisible(true);

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    hideControlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    controlsOpenTimer();
  }, [controlsOpenTimer]);

  const seekForward = (type: 'press' | 'longPress' = 'press') => {
    seek(currentTime + (type === 'press' ? seekTime : longSeekTime));
    controlsOpenTimer();
  };

  const seekBackward = (type: 'press' | 'longPress' = 'press') => {
    seek(currentTime - (type === 'press' ? seekTime : longSeekTime));
    controlsOpenTimer();
  };

  const togglePausePlay = () => {
    setPaused(prev => !prev);
    controlsOpenTimer();
  };
  const handleLongPress = (direction: 'left' | 'right') => {
    const seekAmount = direction === 'left' ? -longSeekTime : longSeekTime;

    if (Platform.OS === 'ios') {
      // IOS: long press is triggered on start and finish pressing
      if (!keyPressed) {
        setKeyPressed(true);
        // Need to remember to pause the video because then we update preview time there and on video progress
        setPaused(true);
        longPressTimeoutRef.current = setInterval(() => {
          setPreviewTime(prevPreviewTime => prevPreviewTime + seekAmount);
          controlsOpenTimer();
        }, 200);
      } else {
        setKeyPressed(false);
        setPaused(false);
        clearInterval(longPressTimeoutRef.current || undefined);
        seek(previewTime);
      }
    } else {
      // ANDROID: long press is triggered from time to time while pressing
      const newPreviewTime = previewTime + seekAmount;
      setKeyPressed(true);
      setPaused(true);
      setPreviewTime(newPreviewTime);
      clearInterval(longPressTimeoutRef.current ?? undefined);
      longPressTimeoutRef.current = setTimeout(() => {
        setKeyPressed(false);
        setPaused(false);
        seek(newPreviewTime);
      }, 600);
    }
  };

  const myTVEventHandler = (evt: HWEvent) => {
    const {eventType} = evt;

    if (eventType === 'playPause') {
      setPaused(prev => !prev);
    }

    if (
      [
        'playPause',
        'select',
        'up',
        'down',
        'left',
        'right',
        'longLeft',
        'longRight',
      ].includes(eventType)
    ) {
      controlsOpenTimer();
    }

    switch (eventType) {
      case 'select':
        togglePausePlay();
        break;
      case 'left':
        seekBackward();
        break;
      case 'right':
        seekForward();
        break;
      case 'longLeft':
        handleLongPress('left');
        break;
      case 'longRight':
        handleLongPress('right');
        break;
      default:
        break;
    }
  };

  useTVEventHandler(myTVEventHandler);

  const seek = (time: number) => {
    const newTime = Math.max(0, Math.min(duration, time));
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    setPreviewTime(newTime);
    controlsOpenTimer();
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        paused={paused}
        onProgress={({currentTime}) => {
          setCurrentTime(currentTime);
          setPreviewTime(currentTime);
        }}
        onLoad={({duration}) => setDuration(duration)}
        repeat
      />

      {controlsVisible && (
        <View style={styles.controlsContainer}>
          <TVFocusGuideView autoFocus>
            <CustomPressable
              style={styles.goBackBtn}
              onPress={() => navigation.goBack()}>
              <GoPreviousSvg width={RFPercentage(2)} height={RFPercentage(2)} />
            </CustomPressable>
          </TVFocusGuideView>

          <TVFocusGuideView style={styles.controls} autoFocus>
            <CustomPressable
              style={styles.controlButton}
              hasTVPreferredFocus={true}>
              {paused ? (
                <PlaySvg
                  style={styles.icon}
                  width={RFPercentage(3.5)}
                  height={RFPercentage(3.5)}
                />
              ) : (
                <PauseSvg
                  style={styles.icon}
                  width={RFPercentage(3.5)}
                  height={RFPercentage(3.5)}
                />
              )}
            </CustomPressable>
          </TVFocusGuideView>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack} />
            <TVFocusGuideView autoFocus>
              <Pressable
                style={({focused}) => [
                  styles.sliderThumb,
                  {
                    left:
                      (previewTime / duration) * (sliderWidth - thumbWidth) ||
                      0,
                    backgroundColor: focused ? '#b0b0b090' : '#fff',
                  },
                ]}
              />
            </TVFocusGuideView>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(previewTime)} / {formatTime(duration)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a2a2a2d',
  },
  video: {
    width: width,
    height: width * (9 / 16),
    backgroundColor: '#000',
    zIndex: -10,
  },
  icon: {},
  goBackBtn: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 40,
    left: 40,
  },
  controlsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  controls: {
    position: 'absolute',
    bottom: RFPercentage(26),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    marginHorizontal: 20,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 60,
    width: sliderWidth,
    marginHorizontal: (width - sliderWidth) / 2,
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#FFFFFF',
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    top: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  timeContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: RFPercentage(1),
  },
});

export default PlayerScreen;

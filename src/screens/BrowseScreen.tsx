import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  TVFocusGuideView,
  ScrollView,
  Pressable,
  findNodeHandle,
} from 'react-native';
import Video from 'react-native-video';
import {useAppNavigation} from '../AppNavigator.tsx';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {RFPercentage} from 'react-native-responsive-fontsize';

const {width, height} = Dimensions.get('window');

const DUMMY_VIDEOS = Array.from({length: 10}).map((_, index) => ({
  id: index.toString(),
  title: `Video ${index + 1}`,
  source:
    index % 2
      ? require('../../assets/videoplayback1.mp4')
      : require('../../assets/videoplayback2.mp4'),
  thumbnail:
    index % 2
      ? require('../../assets/videoThumbnail1.jpg')
      : require('../../assets/videoThumbnail2.jpg'),
}));

type VideoType = (typeof DUMMY_VIDEOS)[0];

export const BrowseScreen = () => {
  const [selectedVideo, setSelectedVideo] = useState(DUMMY_VIDEOS[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [playButtonNativeID, setPlayButtonNativeID] = useState<number | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);
  const playButtonRef = useRef<View>(null);
  const navigation = useAppNavigation();

  useEffect(() => {
    flatListRef.current?.scrollToIndex({index: 0, animated: true});
  }, []);

  useEffect(() => {
    if (playButtonRef.current) {
      setPlayButtonNativeID(findNodeHandle(playButtonRef.current));
    }
  }, []);

  useFocusEffect(() => {
    // Fix ios issue where video is not paused when navigating other screen
    if (Platform.OS === 'ios' && isPaused) {
      setIsPaused(false);
    }
  });

  const handleNavigate = useCallback(() => {
    // Fix ios issue where video is not paused when navigating other screen
    Platform.OS === 'ios' && setIsPaused(true);
    navigation.navigate('PlayerScreen', {videoSource: selectedVideo.source});
  }, [navigation, selectedVideo.source]);

  const renderItem = useCallback(
    ({item, shouldFocusPlay}: {item: VideoType; shouldFocusPlay?: boolean}) => (
      <TouchableOpacity
        style={styles.videoContainer}
        nextFocusUp={
          shouldFocusPlay && playButtonNativeID ? playButtonNativeID : undefined
        }
        onPress={() => {
          handleNavigate();
        }}
        onFocus={() => setSelectedVideo(item)}>
        <Image
          source={item.thumbnail}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <Text style={[styles.text, styles.font]}>{item.title}</Text>
      </TouchableOpacity>
    ),
    [handleNavigate, playButtonNativeID],
  );

  const renderItemCallback = useCallback(
    ({item, shouldFocusPlay}: {item: VideoType; shouldFocusPlay?: boolean}) => {
      return renderItem({item, shouldFocusPlay});
    },
    [renderItem],
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.previewWrapper}>
        <Video
          source={selectedVideo.source}
          style={styles.previewVideo}
          resizeMode="cover"
          repeat
          playInBackground={false}
          paused={isPaused}
        />
        <LinearGradient
          colors={['transparent', '#212121']}
          style={styles.videoBottomGradient}
        />
        <Text style={[styles.moviesHeadingText, styles.font]}>
          How to use react-native-video in FireTV app
        </Text>
        <View style={styles.selectedMovieContainer}>
          <Text style={[styles.selectedMovieTitle, styles.font]}>
            {selectedVideo.title}
          </Text>
          <TVFocusGuideView autoFocus style={{width: width}}>
            <Pressable
              ref={playButtonRef}
              hasTVPreferredFocus={true}
              style={state => ({
                ...styles.playBtn,
                backgroundColor: state.focused ? '#353535' : '#212121',
              })}
              onPress={() => {
                handleNavigate();
              }}>
              <Text style={[styles.playBtnText, styles.font]}>Play</Text>
            </Pressable>
          </TVFocusGuideView>
        </View>
      </View>
      <View style={{marginLeft: 30, marginBottom: 30}}>
        <Text style={[styles.categoriesText, styles.font]}>Last Added</Text>
        <TVFocusGuideView autoFocus>
          <FlatList
            ref={flatListRef}
            data={DUMMY_VIDEOS}
            renderItem={item =>
              renderItemCallback({...item, shouldFocusPlay: true})
            }
            keyExtractor={item => item.id}
            horizontal
          />
        </TVFocusGuideView>
        <Text style={[styles.categoriesText, styles.font]}>Comedies</Text>
        <TVFocusGuideView autoFocus>
          <FlatList
            ref={flatListRef}
            data={DUMMY_VIDEOS}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            horizontal
          />
        </TVFocusGuideView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  font: {
    color: '#FFF',
  },
  moviesHeadingText: {
    position: 'absolute',
    top: 30,
    left: 30,
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
  },
  selectedMovieContainer: {
    position: 'absolute',
    left: 30,
    bottom: height / 3.5,
  },
  selectedMovieTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    paddingBottom: 15,
  },
  previewWrapper: {
    position: 'relative',
    width: width,
    height: height / 1.1,
    marginBottom: -(height / 4),
    justifyContent: 'center',
  },
  videoBottomGradient: {
    position: 'absolute',
    bottom: 0,
    height: height / 7,
    width: width,
  },
  playBtn: {
    width: RFPercentage(20),
    padding: 30,
    borderRadius: 10,
  },
  playBtnText: {
    fontSize: RFPercentage(1.5),
    fontWeight: 'bold',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
    backgroundColor: 'black',
  },
  videoContainer: {
    width: width * 0.2,
    alignItems: 'center',
    marginHorizontal: width * 0.01,
  },
  thumbnail: {
    width: '100%',
    height: width * 0.2 * (9 / 16),
    borderRadius: 10,
  },
  categoriesText: {
    paddingLeft: 20,
    paddingTop: 30,
    marginBottom: 20,
    fontSize: RFPercentage(1.5),
    fontWeight: 'bold',
  },
  text: {
    textAlign: 'center',
    marginTop: 5,
  },
});

export default BrowseScreen;

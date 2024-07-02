import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {BrowseScreen} from './screens/BrowseScreen.tsx';
import {PlayerScreen} from './screens/PlayerScreen.tsx';
import {ReactVideoSource} from 'react-native-video';

export type AppStackNavParamList = {
  BrowseScreen: undefined;
  PlayerScreen: {
    videoSource: ReactVideoSource;
  };
};

const screenOptions: NativeStackNavigationOptions = {
  contentStyle: {
    backgroundColor: '#212121',
  },
  headerShown: false,
};

const Stack = createNativeStackNavigator<AppStackNavParamList>();

export const useAppNavigation = useNavigation<
  NativeStackNavigationProp<AppStackNavParamList>
>;

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="BrowseScreen" component={BrowseScreen} />
        <Stack.Screen
          name="PlayerScreen"
          component={PlayerScreen}
          // options={{presentation: 'fullScreenModal'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

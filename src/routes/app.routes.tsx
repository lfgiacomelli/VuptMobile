import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TabsRoutes } from "./tabs.routes";
import { RequestTravel } from "../screens/RequestTravel";
import { PendingRequest } from "../screens/PendingRequest";
import { Company } from "../screens/Company";
import { Profile } from "../screens/Profile";
import { Travels } from "../screens/Travels";
import { TravelDetails } from "../screens/TravelDetails";
import { Settings } from "../screens/Settings";
import { UpdateProfile } from "../screens/UpdateProfile";
import { Addresses } from "../screens/Addresses";
import { AddAddress } from "../screens/AddAddress";
import { EditAddress } from "../screens/EditAddress";
import { Reviews } from "../screens/Reviews";
import { RouteMap } from "../screens/RouteMap";
import { Support } from "../screens/Support";
import { AddSupport } from "../screens/Support/AddSupport";
import { ChatSupport } from "../screens/Support/ChatSupport";

export type RootStackParamList = {
  Home: undefined;
  RequestTravel: undefined;
  PendingRequest: { sol_codigo: number };
  Company: { emp_codigo: number };
  Profile: undefined;
  Travels: { usu_codigo: number };
  TravelDetails: { sol_codigo: number };
  Settings: undefined;
  UpdateProfile: undefined;
  Addresses: undefined;
  AddAddress: undefined;
  Reviews: undefined;
  EditAddress: { end_codigo: number };
  RouteMap: { via_codigo: number };
  Support: undefined;
  AddSupport: undefined;
  ChatSupport: { sup_codigo: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={TabsRoutes} />
      <Stack.Screen name="RequestTravel" component={RequestTravel} />
      <Stack.Screen name="PendingRequest" component={PendingRequest} />
      <Stack.Screen name="Travels" component={Travels} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Company" component={Company} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
      <Stack.Screen name="TravelDetails" component={TravelDetails} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Addresses" component={Addresses} />
      <Stack.Screen name="AddAddress" component={AddAddress} />
      <Stack.Screen name="EditAddress" component={EditAddress} />
      <Stack.Screen name="Reviews" component={Reviews} />
      <Stack.Screen name="RouteMap" component={RouteMap} />
      <Stack.Screen name="Support" component={Support} />
      <Stack.Screen name="AddSupport" component={AddSupport} />
      <Stack.Screen name="ChatSupport" component={ChatSupport} />
    </Stack.Navigator>
  );
}

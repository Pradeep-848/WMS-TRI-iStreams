import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import BackgroundGradient from '../Components/BackgroundGradient';
import LoginScreen from '../Screens/LoginScreen';
import DataLoadingScreen from '../Screens/DataLoadingScreen';
import HomeScreen1 from '../Screens/HomeScreen1';
import AddOfcLocation from '../Screens/AddOfcLocation';
import MaterialRequest from '../Screens/MaterialRequest';
import MaterialAddScreen from '../Screens/MaterialAddScreen';
import ShopfloorTracking from '../Screens/ShopfloorTracking';
import ShopfloorEmp from '../Screens/ShopfloorEmp';
import DPR from '../Screens/DPR';
import DPREmp from '../Screens/DPREmp';
import LocationRadiusDetector from '../Components/LocationRadiusDetector';
import SuccessAnimationScreen from '../Animations/SuccessAnimationScreen';
import FailureAnimationScreen from '../Animations/FailureAnimationScreen';
import EmployeeList from '../Components/EmployeeList';
import NotificationListScreen from '../Screens/NotificationListScreen';
import ChatScreen from '../Screens/ChatScreen';
import ChatDetailScreen from '../Screens/ChatDetailScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import AddUserScreen from '../Screens/AddUserScreen';
import StockCounting from '../Screens/StockCounting';
import AddMatBarcodes from '../Screens/AddMatBarcodes';
import AddMatBarcodes_1 from '../Screens/AddMatBarcodes_1';
import SupplierInward from '../Screens/SupplierInward';
import SuppInward_Material from '../Screens/SuppInward_Material';
import MaterialTransferNote from '../Screens/MaterialTransferNote';
import DocumentScanner from '../Components/DocumentScannerComponent';
import StoreInward from '../Screens/StoreInward';
import QCTransfer from '../Screens/QCTransfer';
import QCTransElements from '../Screens/QCTransElements';
import MaterialList from '../Components/MaterialList';
import MyRequests from '../Screens/MyRequests';
import MaterialRequestList from '../Screens/MaterialRequestList';
import MaterialListTimeLine from '../Screens/MaterialListTimeLine';
import SwitchMaterialRequestScreen from '../Screens/SwitchMaterialRequestScreen';
import PendingRequests from '../Screens/PendingRequests';
import AllRequests from '../Screens/AllRequests';
import MRItemView from '../Screens/MRItemView';

{/* Material Receiving Process */ }
import VehicleCheckInScreen from '../Screens/MaterialReceivingProcess/VehicleCheckInScreen';
import ActiveReceiptScreen from '../Screens/MaterialReceivingProcess/ActiveReceiptScreen';
import GrnDetailsScreen from '../Screens/MaterialReceivingProcess/GrnDetailsScreen';
import PutawayProcessScreen from '../Screens/MaterialReceivingProcess/PutawayProcessScreen';

{/* Material Issue Process */ }
import MaterialIssueListScreen from '../Screens/MaterialIssueProcess/MaterialIssueListScreen';
import PickMaterialScreen from '../Screens/MaterialIssueProcess/PickMaterialScreen';
import LoadingAndDispatchScreen from '../Screens/MaterialIssueProcess/LoadingAndDispatchScreen';
import SecurityInspectionScreen from '../Screens/MaterialIssueProcess/SecurityInspectionScreen';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home1" component={HomeScreen1} />
                <Stack.Screen name="DataLoading" component={DataLoadingScreen} />
                <Stack.Screen name="AddOfcLocation" component={AddOfcLocation} />
                <Stack.Screen name="EmployeeList" component={EmployeeList} />
                <Stack.Screen name="MaterialRequest" component={MaterialRequest} />
                <Stack.Screen name="MaterialAddScreen" component={MaterialAddScreen} />
                <Stack.Screen name="ShopfloorTracking" component={ShopfloorTracking} />
                <Stack.Screen name="ShopfloorEmp" component={ShopfloorEmp} />
                <Stack.Screen name="DPR" component={DPR} />
                <Stack.Screen name="DPREmp" component={DPREmp} />
                <Stack.Screen name="LocationRadiusDetector" component={LocationRadiusDetector} />
                <Stack.Screen name="NotificationListScreen" component={NotificationListScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="AddUserScreen" component={AddUserScreen} />
                <Stack.Screen name="StockCounting" component={StockCounting} />
                <Stack.Screen name="AddMatBarcodes" component={AddMatBarcodes} />
                <Stack.Screen name="AddMatBarcodes_1" component={AddMatBarcodes_1} />
                <Stack.Screen name="SupplierInward" component={SupplierInward} />
                <Stack.Screen name="SuppInward_Material" component={SuppInward_Material} />
                <Stack.Screen name="MaterialTransferNote" component={MaterialTransferNote} />
                <Stack.Screen name="DocumentScanner" component={DocumentScanner} />
                <Stack.Screen name="StoreInward" component={StoreInward} />
                <Stack.Screen name="QCTransfer" component={QCTransfer} />
                <Stack.Screen name="QCTransElements" component={QCTransElements} />
                <Stack.Screen name="MaterialList" component={MaterialList} />
                <Stack.Screen name="MaterialRequestList" component={MaterialRequestList} />
                <Stack.Screen name="MaterialListTimeLine" component={MaterialListTimeLine} />
                <Stack.Screen name="MyRequests" component={MyRequests} />
                <Stack.Screen name="SwitchMaterialRequestScreen" component={SwitchMaterialRequestScreen} />
                <Stack.Screen name="PendingRequests" component={PendingRequests} />
                <Stack.Screen name="AllRequests" component={AllRequests} />
                <Stack.Screen name="MRItemView" component={MRItemView} />

                {/* Material Receiving Process */}
                <Stack.Screen name="VehicleCheckInScreen" component={VehicleCheckInScreen} />
                <Stack.Screen name="ActiveReceiptScreen" component={ActiveReceiptScreen} />
                <Stack.Screen name="GrnDetailsScreen" component={GrnDetailsScreen} />
                <Stack.Screen name="PutawayProcessScreen" component={PutawayProcessScreen} />

                {/* Material Issue Process */}
                <Stack.Screen name="MaterialIssueListScreen" component={MaterialIssueListScreen} />
                <Stack.Screen name="PickMaterialScreen" component={PickMaterialScreen} />
                <Stack.Screen name="LoadingAndDispatchScreen" component={LoadingAndDispatchScreen} />
                <Stack.Screen name="SecurityInspectionScreen" component={SecurityInspectionScreen} />

                {/* Animation Screens */}
                <Stack.Screen
                    name="SuccessAnimationScreen"
                    component={SuccessAnimationScreen}
                    options={{
                        presentation: 'transparentModal',
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="FailureAnimationScreen"
                    component={FailureAnimationScreen}
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNavigation;

import {
  View,
  ActivityIndicator,
  Modal
} from "react-native";

const loadingOverlay=()=>{
    
    return(
        <Modal
            visible={true}
            transparent
            animationType="fade"
        >
        <View className="absolute w-full h-screen top-0 left-0 z-20 items-center justify-center">
            <View className="absolute w-full h-full top-0 left-0 bg-gray-500 opacity-30">

            </View>
            <View className="p-5 bg-white rounded-lg z-30">
                <ActivityIndicator size="large" color="#2563eb" className="scale-150" />
            </View>
            
        </View>
        </Modal>
    );
};

export default loadingOverlay;
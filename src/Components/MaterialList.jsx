import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Platform, PermissionsAndroid, Modal, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Checkbox, Searchbar, AnimatedFAB, TextInput, Button, IconButton } from 'react-native-paper';
import Header from './Header';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Voice from '@react-native-voice/voice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackgroundGradient from './BackgroundGradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MaterialList = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { selectedMaterial: initialSelected = [], onSelect } = route.params;
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);
  const activeFieldRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [materials, setMaterials] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [advancedEnabled, setAdvancedEnabled] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [description, setDescription] = useState('');

  const [dynamicLists, setDynamicLists] = useState({
    products: [],
    types: [],
    colors: [],
    brands: [],
  });

  const knownColors = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey', 'silver', 'gold', 'beige', 'navy', 'maroon', 'teal', 'olive', 'lime', 'cyan', 'magenta', 'turquoise', 'violet', 'indigo'];

  // Advanced search fields extracted from item name
  const [product, setProduct] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');

  // Field order for sequential input
  const fieldOrder = ['product', 'type', 'color', 'size', 'brand'];
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  useEffect(() => {
    const initialChecked = {};
    initialSelected.forEach(mat => {
      initialChecked[mat.ITEM_CODE + mat.SUB_MATERIAL_NO] = true;
    });
    setCheckedItems(prev => ({
      ...initialChecked,
      ...prev // retain any previously checked items if needed
    }));
  }, [initialSelected]);

  useEffect(() => {
    getData();
    // Cleanup function
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      setStatusMessage('Listening...');
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
      setStatusMessage('');

      // Move to next field after speech ends
      if (advancedEnabled && showAdvancedModal) {
        const nextFieldIndex = currentFieldIndex + 1;
        if (nextFieldIndex < fieldOrder.length) {
          setCurrentFieldIndex(nextFieldIndex);
          // Auto-start listening for next field
          setTimeout(() => startListening(fieldOrder[nextFieldIndex]), 500);
        } else {
          // All fields completed
          setStatusMessage('All fields completed. Press Finish to apply filters.');
        }
      }
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        const spokenText = e.value[0].trim();
        const field = activeFieldRef.current;

        if (advancedEnabled && showAdvancedModal) {
          // Advanced modal fields
          switch (field) {
            case 'product':
              setProduct(spokenText);
              break;
            case 'type':
              setType(spokenText);
              break;
            case 'color':
              setColor(spokenText);
              break;
            case 'size':
              setSize(spokenText);
              break;
            case 'brand':
              setBrand(spokenText);
              break;
            default:
              break;
          }

          // Update description with the spoken text
          updateDescription(field, spokenText);
        } else {
          // Normal search
          setSearchQuery(spokenText);
        }
      }
    };

    Voice.onSpeechError = (e) => {
      console.log('Speech error:', e);
      setIsListening(false);
      setStatusMessage('Error: Try again');
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [advancedEnabled, showAdvancedModal, currentFieldIndex]);

  useEffect(() => {
    const descriptionParts = [];
    if (product) descriptionParts.push(product);
    if (type) descriptionParts.push(type);
    if (color) descriptionParts.push(color);
    if (size) descriptionParts.push(size);
    if (brand) descriptionParts.push(brand);

    setDescription(descriptionParts.join(', '));
  }, [product, type, color, size, brand]);

  // Update description with the spoken/typed values
  const updateDescription = (field, value) => {
    if (!field) return;

    switch (field) {
      case 'product':
        setProduct(value);
        break;
      case 'type':
        setType(value);
        break;
      case 'color':
        setColor(value);
        break;
      case 'size':
        setSize(value);
        break;
      case 'brand':
        setBrand(value);
        break;
      default:
        break;
    }
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to use speech recognition.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startListening = async (field = null) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please enable microphone access.');
      return;
    }

    try {
      if (isListening) {
        await stopListening();
      }

      setActiveField(field);
      activeFieldRef.current = field;

      setIsListening(true);
      setStatusMessage('Listening...');
      await Voice.start('en-US');
    } catch (e) {
      console.error('Start listening error:', e);
      setIsListening(false);
      setStatusMessage('Error starting speech');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      await Voice.cancel();
    } catch (e) {
      console.log('Stop error:', e);
    } finally {
      setIsListening(false);
      setStatusMessage('');
      setActiveField(null);
    }
  };

  const toggleCheckbox = (itemCode) => {
    setCheckedItems(prevState => ({
      ...prevState,
      [itemCode]: !prevState[itemCode]
    }));
  };

  const getData = async () => {
    setLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('MaterialsList');

      const parsedData = storedData ? JSON.parse(storedData) : [];

      const mergedMaterials = mergeMaterials(parsedData, initialSelected);

      setMaterials(mergedMaterials);

      const initialChecked = buildCheckedItems(mergedMaterials, initialSelected);
      setCheckedItems(initialChecked);

      const dynamicLists = buildDynamicLists(mergedMaterials);
      setDynamicLists(dynamicLists);

    } catch (e) {
      console.error('Failed to retrieve data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Merge parsed data with initial selected materials (avoid duplicates)
  const mergeMaterials = (storedMaterials, initialSelected) => {
    const combined = [...storedMaterials];
    initialSelected.forEach(selectedMat => {
      const exists = storedMaterials.some(
        mat => mat.ITEM_CODE === selectedMat.ITEM_CODE && mat.SUB_MATERIAL_NO === selectedMat.SUB_MATERIAL_NO
      );
      if (!exists) {
        combined.push(selectedMat);
      }
    });
    return combined;
  };

  // Create checked items object where keys are ITEM_CODE + SUB_MATERIAL_NO
  const buildCheckedItems = (materials, initialSelected) => {
    const checked = {};
    materials.forEach(mat => {
      const key = mat.ITEM_CODE + mat.SUB_MATERIAL_NO;
      checked[key] = initialSelected.some(
        sel => sel.ITEM_CODE === mat.ITEM_CODE && sel.SUB_MATERIAL_NO === mat.SUB_MATERIAL_NO
      );
    });
    return checked;
  };

  // Build dynamic lists for filters based on material names
  const buildDynamicLists = (materials) => {
    const products = new Set();
    const types = new Set();
    const brands = new Set();
    const colors = new Set();

    materials.forEach(mat => {
      const name = mat.ITEM_NAME?.toLowerCase() || '';
      const words = name.split(/[\s\-_,]+/);

      words.forEach(w => {
        if (knownColors.includes(w)) {
          colors.add(w);
        } else if (w.length > 2 && !/^\d+$/.test(w)) {
          if (w.includes("pole") || w.includes("case") || w.includes("circuit")) {
            types.add(w);
          } else if (w.includes("siemens") || w.includes("schneider") || w.includes("havells") || w.includes("abb")) {
            brands.add(w);
          } else {
            products.add(w);
          }
        }
      });
    });

    return {
      products: Array.from(products),
      types: Array.from(types),
      colors: Array.from(colors),
      brands: Array.from(brands),
    };
  };


  // Enhanced parsing function to extract product, type, color, size, and brand from item name
  const parseItemName = (itemName) => {
    if (!itemName) return { product: '', type: '', color: '', size: '', brand: '' };

    const name = itemName.toLowerCase();
    let product = '';
    let type = '';
    let color = '';
    let size = '';
    let brand = '';

    // Product
    for (const prod of dynamicLists.products) {
      if (name.includes(prod)) {
        product = prod;
        break;
      }
    }

    // Type
    for (const t of dynamicLists.types) {
      if (name.includes(t)) {
        type = t;
        break;
      }
    }

    // Color
    for (const col of dynamicLists.colors) {
      if (name.includes(col)) {
        color = col;
        break;
      }
    }

    // Size (regex same as before)
    const sizeMatches = name.match(/\b(\d+(\.\d+)?\s*(mm|cm|m|inch|in|ft|kg|g|lbs|oz|a|amp|v|volt|w|watt)?)\b/gi);
    if (sizeMatches && sizeMatches.length > 0) {
      size = sizeMatches[0];
    }

    // Brand
    for (const brandName of dynamicLists.brands) {
      if (name.includes(brandName)) {
        brand = brandName;
        break;
      }
    }

    return {
      product: product ? product.charAt(0).toUpperCase() + product.slice(1) : '',
      type: type ? type.charAt(0).toUpperCase() + type.slice(1) : '',
      color: color ? color.charAt(0).toUpperCase() + color.slice(1) : '',
      size: size,
      brand: brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : ''
    };
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const matches = (fieldValue, queryValue) => {
    if (!fieldValue || !queryValue) return false;

    const fv = fieldValue.toLowerCase();
    const qv = queryValue.toLowerCase();

    // Direct match
    if (fv.includes(qv)) return true;

    // Word order independent
    const fvWords = fv.split(/\s+/);
    const qvWords = qv.split(/\s+/);

    return qvWords.every(qw =>
      fvWords.some(fw => fw.includes(qw))
    );
  };

  const filteredMaterials = React.useMemo(() => {
    if (advancedEnabled && (product || type || color || size || brand)) {
      return materials.filter(mat => {
        const parsedName = parseItemName(mat.ITEM_NAME);

        return (!product || matches(parsedName.product, product)) &&
          (!type || matches(parsedName.type, type)) &&
          (!color || matches(parsedName.color, color)) &&
          (!size || matches(parsedName.size, size)) &&
          (!brand || matches(parsedName.brand, brand));
      });
    } else if (!advancedEnabled && searchQuery) {
      return materials.filter(mat => {
        const name = mat.ITEM_NAME || '';
        return matches(name, searchQuery);
      });
    }
    return materials;
  }, [materials, advancedEnabled, product, type, color, size, brand, searchQuery]);

  const clearAdvancedFilters = () => {
    setProduct('');
    setType('');
    setColor('');
    setSize('');
    setBrand('');
    setDescription('');
    setCurrentFieldIndex(0);
  };

  const handleAdvancedToggle = () => {
    if (!advancedEnabled) {
      setAdvancedEnabled(true);
      setShowAdvancedModal(true);
      setSearchQuery('');
      // Start with the first field
      setCurrentFieldIndex(0);
      setTimeout(() => startListening('product'), 500);
    } else {
      setAdvancedEnabled(false);
      setShowAdvancedModal(false);
      clearAdvancedFilters();
    }
  };

  const handleApplyFilters = () => {
    setShowAdvancedModal(false);
    // Don't reset the fields, just close the modal
  };

  const renderAdvancedModal = () => (
    <Modal
      visible={showAdvancedModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowAdvancedModal(false);
        setAdvancedEnabled(false);
        clearAdvancedFilters();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>Advanced Search</Text>
            <IconButton
              icon="close"
              size={24}
              iconColor={colors.onSurface}
              onPress={() => {
                setShowAdvancedModal(false);
                setAdvancedEnabled(false);
                clearAdvancedFilters();
              }}
            />
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Product & Type Row */}
            <View style={styles.modalCol}>
              <View style={styles.modalInputContainer}>
                <Text style={globalStyles.subtitle_2}>Which product you're looking for ?</Text>
                <View style={styles.inputWithMic}>
                  <TextInput
                    mode="outlined"
                    label="Product"
                    value={product}
                    onChangeText={(text) => {
                      setProduct(text);
                      updateDescription('product', text);
                    }}
                    style={styles.modalTextInput}
                    outlineColor={!product ? 'red' : undefined}
                    dense
                    placeholder="Enter Product"
                  />
                  <TouchableOpacity
                    onPress={(isListening && activeField === 'product') ? stopListening : () => startListening('product')}
                    style={[styles.modalMicButton, {
                      backgroundColor: (isListening && activeField === 'product') ? '#f44336' : '#007AFF'
                    }]}
                  >
                    <Icon
                      name={(isListening && activeField === 'product') ? 'stop' : 'mic'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={globalStyles.subtitle_2}>Describe the product type</Text>
                <View style={styles.inputWithMic}>
                  <TextInput
                    mode="outlined"
                    label="Type"
                    value={type}
                    onChangeText={(text) => {
                      setType(text);
                      updateDescription('type', text);
                    }}
                    style={styles.modalTextInput}
                    outlineColor={!type ? 'red' : undefined}
                    dense
                    placeholder="Enter Type"
                  />
                  <TouchableOpacity
                    onPress={(isListening && activeField === 'type') ? stopListening : () => startListening('type')}
                    style={[styles.modalMicButton, {
                      backgroundColor: (isListening && activeField === 'type') ? '#f44336' : '#007AFF'
                    }]}
                  >
                    <Icon
                      name={(isListening && activeField === 'type') ? 'stop' : 'mic'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Color & Size Row */}
            <View style={styles.modalCol}>
              <View style={styles.modalInputContainer}>
                <Text style={globalStyles.subtitle_2}>Is there any color / finish ?</Text>
                <View style={styles.inputWithMic}>
                  <TextInput
                    mode="outlined"
                    label="Color"
                    value={color}
                    onChangeText={(text) => {
                      setColor(text);
                      updateDescription('color', text);
                    }}
                    style={styles.modalTextInput}
                    outlineColor={!color ? 'red' : undefined}
                    dense
                    placeholder="Enter Finish / Color"
                  />
                  <TouchableOpacity
                    onPress={(isListening && activeField === 'color') ? stopListening : () => startListening('color')}
                    style={[styles.modalMicButton, {
                      backgroundColor: (isListening && activeField === 'color') ? '#f44336' : '#007AFF'
                    }]}
                  >
                    <Icon
                      name={(isListening && activeField === 'color') ? 'stop' : 'mic'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={globalStyles.subtitle_2}>What is the size ?</Text>
                <View style={styles.inputWithMic}>
                  <TextInput
                    mode="outlined"
                    label="Size"
                    value={size}
                    onChangeText={(text) => {
                      setSize(text);
                      updateDescription('size', text);
                    }}
                    style={styles.modalTextInput}
                    outlineColor={!size ? 'red' : undefined}
                    dense
                    placeholder="Enter Size"
                  />
                  <TouchableOpacity
                    onPress={(isListening && activeField === 'size') ? stopListening : () => startListening('size')}
                    style={[styles.modalMicButton, {
                      backgroundColor: (isListening && activeField === 'size') ? '#f44336' : '#007AFF'
                    }]}
                  >
                    <Icon
                      name={(isListening && activeField === 'size') ? 'stop' : 'mic'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Brand Row */}
            <View style={styles.modalCol}>
              <View style={styles.modalInputContainer}>
                <Text style={globalStyles.subtitle_2}>Which brand ?</Text>
                <View style={styles.inputWithMic}>
                  <TextInput
                    mode="outlined"
                    label="Brand"
                    value={brand}
                    onChangeText={(text) => {
                      setBrand(text);
                      updateDescription('brand', text);
                    }}
                    style={styles.modalTextInput}
                    outlineColor={!brand ? 'red' : undefined}
                    dense
                    placeholder="Enter Brand"
                  />
                  <TouchableOpacity
                    onPress={(isListening && activeField === 'brand') ? stopListening : () => startListening('brand')}
                    style={[styles.modalMicButton, {
                      backgroundColor: (isListening && activeField === 'brand') ? '#f44336' : '#007AFF'
                    }]}
                  >
                    <Icon
                      name={(isListening && activeField === 'brand') ? 'stop' : 'mic'}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Status Message */}
            {statusMessage ? (
              <Text style={styles.modalStatus}>{statusMessage}</Text>
            ) : null}

            {/* Description Summary */}
            <View style={styles.resultsSummary}>
              <Text style={globalStyles.subtitle}>
                Description:
              </Text>
              <Text style={{ marginLeft: 10, fontSize: 15, fontFamily: "Inter-SemiBold" }}>
                {description || 'No description yet.'}
              </Text>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={clearAdvancedFilters}
              style={styles.clearButton}
              labelStyle={{ color: colors.primary }}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={handleApplyFilters}
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              labelStyle={{ color: colors.onPrimary }}
            >
              Finish
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <BackgroundGradient>
      <View style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
        <Header title="Materials List" />

        {/* Normal Search with mic */}
        {!advancedEnabled && (
          <View style={[globalStyles.twoInputContainer1]}>
            <View style={globalStyles.flex_1}>
              <Searchbar
                style={[globalStyles.my_10, { backgroundColor: colors.card }]}
                placeholderTextColor={colors.text}
                iconColor={colors.text}
                placeholder="Search Materials"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={[styles.micButton, { backgroundColor: isListening ? '#f44336' : '#007AFF' }]}
              onPress={isListening ? stopListening : () => startListening()}
            >
              <Icon name={isListening ? 'stop' : 'mic'} size={22} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Advanced search toggle */}
        <View style={styles.checkboxRow}>
          <Checkbox
            theme={theme}
            status={advancedEnabled ? 'checked' : 'unchecked'}
            onPress={handleAdvancedToggle}
          />
          <Text style={globalStyles.subtitle_3}>Enable Advanced Search</Text>
          {advancedEnabled && (
            <TouchableOpacity
              style={styles.advancedButton}
              onPress={() => setShowAdvancedModal(true)}
            >
              <Icon name="tune" size={20} color={colors.primary} />
              <Text style={[styles.advancedButtonText, { color: colors.primary }]}>
                Filters ({Object.values({ product, type, color, size, brand }).filter(v => v.trim()).length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[globalStyles.subtitle_2, { marginBottom: 10 }]}>
          Selected Materials: {checkedCount} | Showing: {filteredMaterials.length}
        </Text>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredMaterials}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.ITEM_CODE + item.SUB_MATERIAL_NO}
            renderItem={({ item }) => {
              const parsedName = parseItemName(item.ITEM_NAME);
              return (
                <TouchableOpacity
                  style={[
                    globalStyles.twoInputContainer,
                    globalStyles.borderRadius_15,
                    globalStyles.p_10,
                    globalStyles.mb_10,
                    { backgroundColor: colors.card },
                  ]}
                  onPress={() => toggleCheckbox(item.ITEM_CODE + item.SUB_MATERIAL_NO)}
                >
                  <Image
                    source={require('../../assets/noimage.png')}
                    style={{ height: 60, width: 60 }}
                  />
                  <View style={[globalStyles.flex_1, globalStyles.ml_10, globalStyles.justifyContentCenter]}>
                    <View style={[globalStyles.twoInputContainer1, { justifyContent: 'flex-start' }]}>
                      <Text style={[globalStyles.subtitle, { color: colors.primary }]}>{item.ITEM_CODE}</Text>
                      <Text style={globalStyles.subtitle_2}>{item.SUB_MATERIAL_NO}</Text>
                    </View>
                    <Text style={globalStyles.subtitle_2}>{item.ITEM_NAME}</Text>

                    {advancedEnabled && (
                      <View style={styles.parsedInfo}>
                        {parsedName.product && <Text style={styles.tagText}>Product: {parsedName.product}</Text>}
                        {parsedName.type && <Text style={styles.tagText}>Type: {parsedName.type}</Text>}
                        {parsedName.color && <Text style={styles.tagText}>Color: {parsedName.color}</Text>}
                        {parsedName.size && <Text style={styles.tagText}>Size: {parsedName.size}</Text>}
                        {parsedName.brand && <Text style={styles.tagText}>Brand: {parsedName.brand}</Text>}
                      </View>
                    )}
                  </View>
                  <View style={globalStyles.justalignCenter}>
                    <Checkbox
                      status={checkedItems[item.ITEM_CODE + item.SUB_MATERIAL_NO] ? 'checked' : 'unchecked'}
                      color={colors.primary}
                      onPress={() => toggleCheckbox(item.ITEM_CODE + item.SUB_MATERIAL_NO)}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No materials found</Text>
                <Text style={styles.emptySubText}>Try adjusting your search criteria</Text>
              </View>
            )}
          />
        )}

        {renderAdvancedModal()}

        <AnimatedFAB
          visible={checkedCount >= 1}
          icon="check"
          color={colors.background}
          style={[globalStyles.fab, { backgroundColor: colors.primary }]}
          onPress={() => {
            const currentSelections = materials.filter(mat =>
              checkedItems[mat.ITEM_CODE + mat.SUB_MATERIAL_NO]
            );

            const mergedSelections = [...initialSelected];

            currentSelections.forEach(mat => {
              const exists = mergedSelections.find(m =>
                m.ITEM_CODE === mat.ITEM_CODE && m.SUB_MATERIAL_NO === mat.SUB_MATERIAL_NO
              );
              if (!exists) {
                mergedSelections.push(mat);
              }
            });

            onSelect(mergedSelections);
            navigation.goBack();
          }}
        />
      </View>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  micButton: {
    marginLeft: 10,
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWithMic: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  status: { textAlign: 'center', color: '#007AFF', marginBottom: 10 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  advancedButtonText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.95,
    maxHeight: screenHeight * 0.8,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalCol: {
    flexDirection: 'col',
    marginBottom: 5,
  },
  modalInputContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginTop: 5
  },
  modalTextInput: {
    flex: 1,
    height: 45,
  },
  modalMicButton: {
    position: 'absolute',
    right: 8,
    top: 15,
    padding: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  modalStatus: {
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  resultsSummary: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  resultsText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 0.4,
  },
  applyButton: {
    flex: 0.5,
  },
  parsedInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tagText: {
    fontSize: 10,
    backgroundColor: '#e8f4fd',
    color: '#1976d2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
});

export default MaterialList;
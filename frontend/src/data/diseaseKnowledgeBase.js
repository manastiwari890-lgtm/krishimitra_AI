// =====================================================
// KRISHIMITRA AI
// CROP DISEASE KNOWLEDGE BASE - V1
// =====================================================

export const diseaseKnowledgeBase = {

  // ===================================================
  // CORN / MAIZE
  // ===================================================

  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    crop: "Corn (Maize)",
    disease: "Gray Leaf Spot",
    healthy: false,

    symptoms: [
      "Small leaf spots that develop into rectangular gray-to-brown lesions.",
      "Mature lesions often have straight edges limited by leaf veins.",
      "Severe infection can cause large areas of leaf tissue to die.",
    ],

    treatment: [
      "Remove or manage infected crop residue where practical.",
      "Use resistant or tolerant corn hybrids.",
      "Seek local agricultural advice if disease becomes severe.",
    ],

    prevention: [
      "Rotate corn with non-host crops.",
      "Avoid repeatedly growing susceptible corn in the same field.",
      "Use resistant hybrids where available.",
      "Manage infected crop residue after harvest.",
    ],
  },


  "Corn_(maize)___Common_rust_": {
    crop: "Corn (Maize)",
    disease: "Common Rust",
    healthy: false,

    symptoms: [
      "Rust-colored to dark-brown elongated pustules on leaves.",
      "Pustules may occur on both upper and lower leaf surfaces.",
      "Severe infection may cause yellowing and leaf death.",
    ],

    treatment: [
      "Monitor disease development across the field.",
      "Use resistant corn hybrids as the primary management strategy.",
      "Consult local agricultural guidance if infection becomes severe.",
    ],

    prevention: [
      "Select resistant hybrids.",
      "Regularly inspect young leaves during cool and humid weather.",
      "Maintain good overall crop health.",
    ],
  },


  "Corn_(maize)___Northern_Leaf_Blight": {
    crop: "Corn (Maize)",
    disease: "Northern Leaf Blight",
    healthy: false,

    symptoms: [
      "Long canoe-shaped lesions on corn leaves.",
      "Lesions often begin gray-green and later become tan.",
      "Symptoms commonly begin on lower leaves and spread upward.",
      "Severe infection can result in extensive leaf blighting.",
    ],

    treatment: [
      "Monitor infected fields for disease progression.",
      "Use resistant hybrids in future plantings.",
      "Manage infected crop residue where appropriate.",
      "Seek agricultural advice if disease develops early or spreads rapidly.",
    ],

    prevention: [
      "Plant resistant corn hybrids.",
      "Rotate crops where practical.",
      "Manage infected corn residue after harvest.",
      "Monitor crops during prolonged periods of leaf moisture.",
    ],
  },


  "Corn_(maize)___healthy": {
    crop: "Corn (Maize)",
    disease: "Healthy",
    healthy: true,

    symptoms: [
      "No obvious disease symptoms detected.",
      "Leaf appearance is consistent with the healthy class learned by the model.",
    ],

    treatment: [],

    prevention: [
      "Continue regular crop monitoring.",
      "Maintain balanced nutrition and irrigation.",
      "Use appropriate crop rotation practices.",
      "Inspect plants periodically for new disease symptoms.",
    ],
  },


  // ===================================================
  // BELL PEPPER
  // ===================================================

  "Pepper,_bell___Bacterial_spot": {
    crop: "Bell Pepper",
    disease: "Bacterial Spot",
    healthy: false,

    symptoms: [
      "Small brown spots may develop on leaves.",
      "Leaf spots can enlarge and damaged tissue may fall out.",
      "Severe infection can cause leaf loss.",
      "Spots may also occur on fruit.",
    ],

    treatment: [
      "Remove heavily infected plant material where practical.",
      "Avoid handling plants while foliage is wet.",
      "Keep foliage as dry as possible.",
      "Sanitize tools used on infected plants.",
    ],

    prevention: [
      "Use healthy seed and transplants.",
      "Avoid overhead irrigation where possible.",
      "Improve spacing and airflow between plants.",
      "Rotate away from tomato and pepper crops.",
    ],
  },


  "Pepper,_bell___healthy": {
    crop: "Bell Pepper",
    disease: "Healthy",
    healthy: true,

    symptoms: [
      "No obvious disease symptoms detected.",
      "Leaf appearance is consistent with healthy bell pepper foliage.",
    ],

    treatment: [],

    prevention: [
      "Continue regular crop monitoring.",
      "Avoid prolonged leaf wetness.",
      "Maintain adequate plant spacing.",
      "Use clean planting material.",
    ],
  },


  // ===================================================
  // POTATO
  // ===================================================

  "Potato___Early_blight": {
    crop: "Potato",
    disease: "Early Blight",
    healthy: false,

    symptoms: [
      "Dark brown spots commonly develop on older leaves.",
      "Larger lesions may develop target-like concentric rings.",
      "Leaf tissue surrounding lesions may turn yellow.",
      "Severe infection can lead to premature leaf death.",
    ],

    treatment: [
      "Remove severely infected foliage where practical.",
      "Maintain adequate crop nutrition.",
      "Avoid unnecessary leaf wetness.",
      "Seek local agricultural guidance if disease continues spreading.",
    ],

    prevention: [
      "Rotate potatoes with unrelated crops.",
      "Manage infected plant residue.",
      "Avoid overhead irrigation where possible.",
      "Maintain healthy plant growth and balanced nutrition.",
    ],
  },


  "Potato___Late_blight": {
    crop: "Potato",
    disease: "Late Blight",
    healthy: false,

    symptoms: [
      "Large irregular dark-brown lesions may appear on leaves.",
      "Lesions can have green-gray margins.",
      "White growth may appear around lesions during humid conditions.",
      "Disease can spread rapidly during cool and wet weather.",
    ],

    treatment: [
      "Treat suspected late blight as potentially serious.",
      "Remove isolated infected plants where appropriate to reduce spread.",
      "Avoid moving infected plant material between fields.",
      "Contact a local agricultural expert promptly if late blight is suspected.",
    ],

    prevention: [
      "Use certified healthy potato seed.",
      "Destroy or properly manage infected potato cull piles.",
      "Control volunteer potato plants.",
      "Monitor crops closely during cool and wet conditions.",
      "Use resistant varieties where available.",
    ],
  },


  "Potato___healthy": {
    crop: "Potato",
    disease: "Healthy",
    healthy: true,

    symptoms: [
      "No obvious disease symptoms detected.",
      "Leaf appearance is consistent with healthy potato foliage.",
    ],

    treatment: [],

    prevention: [
      "Continue regular field monitoring.",
      "Use certified planting material.",
      "Practice crop rotation.",
      "Maintain balanced irrigation and nutrition.",
    ],
  },


  // ===================================================
  // TOMATO
  // ===================================================

  "Tomato___Bacterial_spot": {
    crop: "Tomato",
    disease: "Bacterial Spot",
    healthy: false,

    symptoms: [
      "Small brown circular spots may appear on leaves.",
      "Leaf spots may have yellow halos.",
      "The center of some lesions may fall out.",
      "Fruit may also develop damaging spots.",
    ],

    treatment: [
      "Remove severely infected material where practical.",
      "Avoid working with plants while foliage is wet.",
      "Keep leaves dry during irrigation.",
      "Clean tools after contact with infected plants.",
    ],

    prevention: [
      "Use healthy seed and disease-free transplants.",
      "Water plants at soil level rather than wetting leaves.",
      "Improve airflow around plants.",
      "Rotate away from tomato and pepper crops.",
    ],
  },


  "Tomato___Early_blight": {
    crop: "Tomato",
    disease: "Early Blight",
    healthy: false,

    symptoms: [
      "Dark spots commonly begin on older lower leaves.",
      "Larger lesions develop characteristic concentric rings.",
      "Yellow tissue may develop around infected areas.",
      "Severe disease can cause leaves to brown and fall.",
    ],

    treatment: [
      "Remove infected lower leaves where practical.",
      "Dispose of infected material away from healthy plants.",
      "Keep foliage dry when watering.",
      "Sanitize pruning tools after working with infected plants.",
    ],

    prevention: [
      "Apply mulch to reduce soil splash onto lower leaves.",
      "Water at the base of plants.",
      "Stake or trellis plants to improve airflow.",
      "Rotate tomatoes and related crops.",
      "Remove infected plant debris after the season.",
    ],
  },


  "Tomato___Late_blight": {
    crop: "Tomato",
    disease: "Late Blight",
    healthy: false,

    symptoms: [
      "Large dark-brown blotches develop on leaves.",
      "Lesions may have green-gray margins.",
      "Dark lesions can also develop on stems.",
      "Fruit may develop firm dark-brown areas.",
      "Disease may spread very quickly in cool and wet weather.",
    ],

    treatment: [
      "Treat suspected late blight as potentially serious.",
      "Remove isolated infected plants where appropriate.",
      "Avoid spreading infected plant material.",
      "Contact a local agricultural expert if late blight is suspected.",
    ],

    prevention: [
      "Inspect transplants before planting.",
      "Keep foliage as dry as possible.",
      "Use drip irrigation or water at the plant base.",
      "Provide adequate spacing and airflow.",
      "Rotate away from tomato, potato, pepper and eggplant.",
    ],
  },


  "Tomato___Leaf_Mold": {
    crop: "Tomato",
    disease: "Leaf Mold",
    healthy: false,

    symptoms: [
      "Pale green or yellow spots develop on upper leaf surfaces.",
      "Olive-green to brown velvety growth may form underneath spots.",
      "Affected leaves can turn brown, wither and die.",
      "Disease is particularly associated with high humidity.",
    ],

    treatment: [
      "Remove heavily infected leaves where practical.",
      "Reduce humidity around plants.",
      "Increase ventilation and airflow.",
      "Avoid wetting foliage during irrigation.",
    ],

    prevention: [
      "Provide good plant spacing.",
      "Improve greenhouse or tunnel ventilation.",
      "Keep relative humidity under control.",
      "Avoid prolonged leaf wetness.",
      "Use resistant varieties where available.",
    ],
  },


  "Tomato___Septoria_leaf_spot": {
    crop: "Tomato",
    disease: "Septoria Leaf Spot",
    healthy: false,

    symptoms: [
      "Numerous small circular spots develop on leaves.",
      "Spots often have darker edges and lighter centers.",
      "Tiny dark structures may become visible within lesions.",
      "Disease commonly begins on lower leaves.",
    ],

    treatment: [
      "Remove infected lower leaves where practical.",
      "Keep leaves dry during irrigation.",
      "Dispose of heavily infected plant material.",
      "Improve airflow around plants.",
    ],

    prevention: [
      "Use mulch to reduce soil splash.",
      "Water at the base of plants.",
      "Stake or cage tomatoes to improve airflow.",
      "Rotate crops.",
      "Remove infected crop debris after harvest.",
    ],
  },


  "Tomato___Spider_mites Two-spotted_spider_mite": {
    crop: "Tomato",
    disease: "Two-Spotted Spider Mite Damage",
    healthy: false,

    symptoms: [
      "Leaves may develop fine pale or yellow stippling.",
      "Heavily affected leaves can become yellow or bronze.",
      "Fine webbing may appear on leaves during severe infestations.",
      "Damage may increase during hot and dry conditions.",
    ],

    treatment: [
      "Inspect the undersides of leaves for mites.",
      "Remove severely affected leaves where practical.",
      "Avoid allowing plants to become severely water-stressed.",
      "Seek local pest-management advice if infestation becomes severe.",
    ],

    prevention: [
      "Inspect plants regularly for early mite activity.",
      "Maintain appropriate irrigation.",
      "Avoid unnecessary plant stress.",
      "Monitor nearby plants because mites can spread between plants.",
    ],
  },


  "Tomato___Target_Spot": {
    crop: "Tomato",
    disease: "Target Spot",
    healthy: false,

    symptoms: [
      "Brown leaf spots may develop with concentric ring patterns.",
      "Lesions can enlarge and merge as disease progresses.",
      "Severe infection may result in substantial leaf loss.",
    ],

    treatment: [
      "Remove heavily infected foliage where practical.",
      "Improve airflow around plants.",
      "Avoid prolonged leaf wetness.",
      "Seek local agricultural guidance if disease becomes severe.",
    ],

    prevention: [
      "Maintain good plant spacing.",
      "Avoid overhead irrigation where practical.",
      "Remove infected plant debris.",
      "Rotate crops where appropriate.",
    ],
  },


  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
    crop: "Tomato",
    disease: "Tomato Yellow Leaf Curl Virus",
    healthy: false,

    symptoms: [
      "Leaves may become yellow and curl upward.",
      "New leaves may appear smaller than normal.",
      "Plants may become stunted.",
      "Flower and fruit production may be reduced.",
    ],

    treatment: [
      "There is no direct cure for a plant already infected with the virus.",
      "Remove severely infected plants where appropriate.",
      "Manage whitefly populations, which can spread the virus.",
      "Avoid moving infected plant material to healthy production areas.",
    ],

    prevention: [
      "Use healthy transplants.",
      "Use resistant or tolerant varieties where available.",
      "Monitor crops for whiteflies.",
      "Remove infected plants and susceptible weeds where appropriate.",
    ],
  },


  "Tomato___Tomato_mosaic_virus": {
    crop: "Tomato",
    disease: "Tomato Mosaic Virus",
    healthy: false,

    symptoms: [
      "Leaves may show mottled light and dark green patterns.",
      "Leaves can become distorted or curled.",
      "Plant growth may become reduced.",
      "Fruit development and quality may be affected.",
    ],

    treatment: [
      "There is no direct cure for virus-infected plants.",
      "Remove severely infected plants where appropriate.",
      "Avoid handling healthy plants immediately after infected plants.",
      "Clean tools and hands to reduce mechanical spread.",
    ],

    prevention: [
      "Use healthy seed and transplants.",
      "Sanitize tools and equipment.",
      "Remove infected plant material.",
      "Use resistant varieties where available.",
      "Maintain good hygiene when handling plants.",
    ],
  },


  "Tomato___healthy": {
    crop: "Tomato",
    disease: "Healthy",
    healthy: true,

    symptoms: [
      "No obvious disease symptoms detected.",
      "Leaf appearance is consistent with healthy tomato foliage.",
    ],

    treatment: [],

    prevention: [
      "Continue regular crop monitoring.",
      "Water at the base of plants when practical.",
      "Maintain good airflow.",
      "Use crop rotation and sanitation practices.",
    ],
  },
};


// =====================================================
// GET DISEASE INFORMATION
// =====================================================

export function getDiseaseKnowledge(className) {
  if (!className) {
    return null;
  }

  return diseaseKnowledgeBase[className] || null;
}
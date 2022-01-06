const router = require("express").Router();
const cardController = require("../controllers/controller.card");
const { protect } = require("../middleware/auth");

router.post("/create", protect, cardController.post_card);

router.get("/read", protect, cardController.get_card);

router.post("/delete", protect, cardController.delete_card);

router.put("/edit/:id", protect, cardController.update_card);

router.get("/details/:id", protect, cardController.find_by_id);

router.get("/decrypt", protect, cardController.show_pincode);

router.put("/favorite", protect, cardController.add_to_favorite);

router.get("/favorites", protect, cardController.favorites);

// Views

module.exports = router;

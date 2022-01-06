const router = require("express").Router();
const passwordController = require("../controllers/controller.password");
const { protect } = require("../middleware/auth");

router.post("/create", protect, passwordController.post_password);

router.put("/favorite", protect, passwordController.add_to_favorite);

router.get("/read", protect, passwordController.get_password);

router.get("/favorites", protect, passwordController.favorites);

router.post("/delete", protect, passwordController.delete_password);

router.put("/edit/:id", protect, passwordController.update_password);

router.get("/details/:id", protect, passwordController.find_by_id);

module.exports = router;

const { Buffer } = require("buffer");
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = "youfuckwithmeyoufuckwiththebest3";
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
};

const decrypt = (text) => {
  let iv = Buffer.from(text.iv, "hex");
  let encrypted = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted.toString();
};

const randomId = (length = 6) => {
  const charArray =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += charArray.charAt(Math.floor(Math.random() * charArray.length));
  }
  return id;
};

module.exports = { encrypt, decrypt, randomId };

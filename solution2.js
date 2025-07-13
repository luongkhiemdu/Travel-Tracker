import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "562184",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// GET home page
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

//INSERT new country
app.post("/add", async (req, res) => {
  // 1. Lấy dữ liệu tên quốc gia người dùng nhập từ form gửi lên (input name="country")
  const input = req.body["country"];

  // 2. Truy vấn bảng countries để lấy country_code dựa vào tên quốc gia vừa nhập
  const result = await db.query(
    "SELECT country_code FROM countries WHERE country_name = $1",
    [input]
  );

  // 3. Nếu tìm thấy quốc gia (result.rows.length !== 0)
  if (result.rows.length !== 0) {
    // 4. Lấy country_code đầu tiên từ kết quả truy vấn
    const data = result.rows[0];
    const countryCode = data.country_code;

    // 5. Thêm country_code này vào bảng visited_countries
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
      countryCode,
    ]);
    // 6. Sau khi thêm xong, chuyển hướng về trang chủ
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

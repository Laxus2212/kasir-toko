/*
 * PINDAH HALAMAN
 */
function bukaHalaman(namaHalaman, tombol) {
    const semuaHalaman = document.querySelectorAll(".page");

    semuaHalaman.forEach(function(halaman) {
        halaman.classList.remove("active");
    });

    document.getElementById(namaHalaman).classList.add("active");

    const semuaTombol = document.querySelectorAll(".menu-btn");

    semuaTombol.forEach(function(btn) {
        btn.classList.remove("active");
    });

    tombol.classList.add("active");

    const judul = tombol.textContent.trim();

    document.getElementById("judulHalaman").textContent = judul;
}


/*
 * FORMAT RUPIAH
 */
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}


/*
 * KERANJANG
 */
let keranjang = [];


function getTotal() {
    return keranjang.reduce(function(total, produk) {
        return total + produk.subtotal;
    }, 0);
}


function tampilkanKeranjang() {
    const tbody = document.getElementById("keranjang");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (keranjang.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="kosong">
                    Keranjang kosong
                </td>
            </tr>
        `;
    }

    keranjang.forEach(function(produk) {
        tbody.innerHTML += `
            <tr>
                <td>${produk.nama}</td>
                <td>${produk.jumlah}</td>
                <td>${formatRupiah(produk.subtotal)}</td>
            </tr>
        `;
    });

    const totalElement = document.getElementById("total");

    if (totalElement) {
        totalElement.textContent = formatRupiah(getTotal());
    }
}


/*
 * GOOGLE SHEETS
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxX9XqRImLGvvTosHjLYBS4G4HkZPwTb_XfKxiFNHxs83BSYkbm9XDz28gJ4huMsPML/exec";


function kirimKeGoogleSheets(data) {
    const form = document.createElement("form");

    form.method = "POST";
    form.target = "kirimFrame";
    form.action = SCRIPT_URL;

    const input = document.createElement("input");

    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(data);

    form.appendChild(input);

    document.body.appendChild(form);

    form.submit();

    form.remove();
}


/*
 * FORM TAMBAH PRODUK
 */
function tampilkanFormProduk() {
    const form = document.getElementById("formProduk");

    if (form) {
        form.style.display = "block";
    }
}


function tutupFormProduk() {
    const form = document.getElementById("formProduk");

    if (form) {
        form.style.display = "none";
    }
}


function simpanProduk() {
    const kode = document.getElementById("kodeProduk").value.trim();
    const barcode = document.getElementById("barcodeProduk").value.trim();
    const nama = document.getElementById("namaProdukBaru").value.trim();
    const kategori = document.getElementById("kategoriProduk").value.trim();

    const hargaBeli =
        Number(document.getElementById("hargaBeli").value);

    const hargaJual =
        Number(document.getElementById("hargaJual").value);

    const stok =
        Number(document.getElementById("stokAwal").value);

    const stokMinimum =
        Number(document.getElementById("stokMinimum").value);

    const satuan =
        document.getElementById("satuanProduk").value;

    const status =
        document.getElementById("statusProduk").value;


    if (!kode) {
        alert("Kode produk wajib diisi.");
        return;
    }


    if (!nama) {
        alert("Nama produk wajib diisi.");
        return;
    }


    if (hargaJual <= 0) {
        alert("Harga jual wajib diisi.");
        return;
    }


    if (hargaBeli < 0) {
        alert("Harga beli tidak boleh kurang dari 0.");
        return;
    }


    if (stok < 0) {
        alert("Stok tidak boleh kurang dari 0.");
        return;
    }


    const data = {
        action: "produk_tambah",
        kodeProduk: kode,
        barcode: barcode,
        namaProduk: nama,
        kategori: kategori,
        hargaBeli: hargaBeli,
        hargaJual: hargaJual,
        stok: stok,
        stokMinimum: stokMinimum,
        satuan: satuan,
        status: status
    };


    kirimKeGoogleSheets(data);


    alert("Produk berhasil dikirim ke Google Sheets.");


    document.getElementById("kodeProduk").value = "";
    document.getElementById("barcodeProduk").value = "";
    document.getElementById("namaProdukBaru").value = "";
    document.getElementById("kategoriProduk").value = "";
    document.getElementById("hargaBeli").value = "";
    document.getElementById("hargaJual").value = "";
    document.getElementById("stokAwal").value = "0";
    document.getElementById("stokMinimum").value = "5";
    document.getElementById("satuanProduk").value = "PCS";
    document.getElementById("statusProduk").value = "Aktif";

    tutupFormProduk();
}


/*
 * PEMBAYARAN
 */
function prosesPembayaran() {

    if (keranjang.length === 0) {
        alert("Keranjang masih kosong.");
        return;
    }


    const metode =
        document.getElementById("metodePembayaran").value;

    const total = getTotal();

    let uangBayar = 0;


    if (metode === "cash") {

        uangBayar =
            Number(document.getElementById("uangBayar").value);

        if (uangBayar < total) {
            alert("Uang pembayaran kurang.");
            return;
        }
    }


    const sekarang = new Date();

    const idTransaksi =
        "TRX-" + sekarang.getTime();

    const tanggal =
        sekarang.toLocaleDateString("id-ID");

    const jam =
        sekarang.toLocaleTimeString("id-ID");


    keranjang.forEach(function(produk) {

        const data = {

            idTransaksi: idTransaksi,

            tanggal: tanggal,

            jam: jam,

            produk: produk.nama,

            jumlah: produk.jumlah,

            total: produk.subtotal,

            metode: metode.toUpperCase()
        };


        kirimKeGoogleSheets(data);
    });


    let pesan =
        "PEMBAYARAN BERHASIL!\n\n";

    pesan +=
        "ID Transaksi: " + idTransaksi + "\n";

    pesan +=
        "Total: " + formatRupiah(total);


    if (metode === "cash") {

        pesan +=
            "\nKembalian: " +
            formatRupiah(uangBayar - total);

    } else {

        pesan +=
            "\nMetode: QRIS";
    }


    alert(pesan);


    keranjang = [];


    const uangBayarElement =
        document.getElementById("uangBayar");

    if (uangBayarElement) {
        uangBayarElement.value = "";
    }


    const kembalianElement =
        document.getElementById("kembalian");

    if (kembalianElement) {
        kembalianElement.textContent = "Rp 0";
    }


    tampilkanKeranjang();
}


/*
 * IFRAME UNTUK KIRIM DATA
 */
const iframe = document.createElement("iframe");

iframe.name = "kirimFrame";

iframe.style.display = "none";

document.body.appendChild(iframe);

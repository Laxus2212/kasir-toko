/*
 * ==========================================
 * KONFIGURASI
 * ==========================================
 */

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxX9XqRImLGvvTosHjLYBS4G4HkZPwTb_XfKxiFNHxs83BSYkbm9XDz28gJ4huMsPML/exec";


/*
 * ==========================================
 * DATA
 * ==========================================
 */

let daftarProduk = [];
let keranjang = [];


/*
 * ==========================================
 * PINDAH HALAMAN
 * ==========================================
 */

function bukaHalaman(namaHalaman, tombol) {

    const semuaHalaman =
        document.querySelectorAll(".page");

    semuaHalaman.forEach(function(halaman) {

        halaman.classList.remove("active");

    });


    const halaman =
        document.getElementById(namaHalaman);

    if (halaman) {

        halaman.classList.add("active");

    }


    const semuaTombol =
        document.querySelectorAll(".menu-btn");

    semuaTombol.forEach(function(btn) {

        btn.classList.remove("active");

    });


    if (tombol) {

        tombol.classList.add("active");


        const judul =
            tombol.textContent.trim();


        const judulHalaman =
            document.getElementById(
                "judulHalaman"
            );


        if (judulHalaman) {

            judulHalaman.textContent =
                judul;

        }

    }


    /*
     * Saat membuka Produk
     */

    if (namaHalaman === "kasir") {

    tampilkanProdukKasir();

}


/*
 * Saat membuka Produk
 */

if (namaHalaman === "produk") {

    tampilkanProduk();

}


/*
 * Saat membuka Kasir
 */

if (namaHalaman === "kasir") {

    tampilkanProdukKasir();

}


/*
 * Saat membuka Stok
 */

if (namaHalaman === "stok") {

    tampilkanStok();

}

/*
 * ==========================================
 * FORMAT RUPIAH
 * ==========================================
 */

function formatRupiah(angka) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(
        Number(angka) || 0
    );

}


/*
 * ==========================================
 * AMBIL PRODUK
 * ==========================================
 */

function ambilProduk() {

    const script =
        document.createElement("script");

    script.src =
        SCRIPT_URL +
        "?action=produk&callback=produkCallback&_=" +
        Date.now();

    script.onload =
        function() {

            console.log(
                "Permintaan data produk berhasil dikirim."
            );

            setTimeout(function() {
                script.remove();
            }, 1000);

        };

    script.onerror =
        function() {

            console.error(
                "Gagal memuat data produk dari Apps Script."
            );

            script.remove();

            console.log(
                "Koneksi database gagal."
            );

        };

    document.body.appendChild(script);

}


/*
 * ==========================================
 * CALLBACK PRODUK
 * ==========================================
 */

function produkCallback(result) {

    console.log(
        "Data produk diterima:",
        result
    );


    if (
        !result ||
        !result.success
    ) {

        alert(
            result && result.message
                ? result.message
                : "Gagal mengambil data produk."
        );


        return;

    }


daftarProduk =
    result.data || [];


tampilkanProduk();


tampilkanStok();

}


/*
 * ==========================================
 * TAMPILKAN STOK
 * ==========================================
 */

function tampilkanStok() {

    const tabelStok =
        document.getElementById("tabelStok");

    if (!tabelStok) {
        return;
    }

    if (
        !daftarProduk ||
        daftarProduk.length === 0
    ) {

        tabelStok.innerHTML = `
            <tr>
                <td colspan="5">
                    Belum ada data stok.
                </td>
            </tr>
        `;

        return;
    }

    tabelStok.innerHTML = "";

    daftarProduk.forEach(function(produk) {

        let status = "Aman";

        if (
            Number(produk.stok) <=
            Number(produk.stokMinimum)
        ) {
            status = "Stok Menipis";
        }

        tabelStok.innerHTML += `
            <tr>

                <td>
                    ${produk.kode || "-"}
                </td>

                <td>
                    ${produk.nama || "-"}
                </td>

                <td>
                    ${produk.stok ?? 0}
                </td>

                <td>
                    ${produk.stokMinimum ?? 0}
                </td>

                <td>
                    ${status}
                </td>

            </tr>
        `;

    });

}


/*
 * ==========================================
 * TAMPILKAN PRODUK DI KASIR
 * ==========================================
 */


/*
 * LOGIKA:
 *
 * Search kosong
 *     = tidak tampilkan produk
 *
 * Search ada isi
 *     = tampilkan produk yang cocok
 *
 */

function tampilkanProdukKasir() {

    const container =
        document.getElementById(
            "daftarProdukKasir"
        );


    if (!container) {

        return;

    }


    const searchInput =
        document.getElementById(
            "searchProdukKasir"
        );


    const kataKunci =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    /*
     * Selalu bersihkan hasil lama
     */

    container.innerHTML = "";


    /*
     * Kalau belum mengetik apa pun,
     * jangan tampilkan produk.
     */

    if (!kataKunci) {

        return;

    }


    let jumlahHasil = 0;


    daftarProduk.forEach(
        function(produk) {

            /*
             * Hanya produk aktif
             */

            if (
                String(produk.status)
                    .toLowerCase() !== "aktif"
            ) {

                return;

            }


            const nama =
                String(
                    produk.nama || ""
                ).toLowerCase();


            const kode =
                String(
                    produk.kode || ""
                ).toLowerCase();


            /*
             * Cari berdasarkan:
             * Nama Produk
             * atau Kode Produk
             */

            if (
                !nama.includes(kataKunci) &&
                !kode.includes(kataKunci)
            ) {

                return;

            }


            jumlahHasil++;


            container.innerHTML += `

                <div
                    class="produk-kasir"
                    onclick="tambahKeKeranjang(
                        '${escapeHtml(produk.kode)}'
                    )"
                >

                    <div class="nama-produk">
                        ${escapeHtml(produk.nama)}
                    </div>

                    <div class="harga-produk">
                        ${formatRupiah(
                            produk.hargaJual
                        )}
                    </div>

                    <div class="stok-produk">
                        Stok:
                        ${produk.stok || 0}
                    </div>

                </div>

            `;

        }
    );


    /*
     * Tidak ada hasil
     */

    if (jumlahHasil === 0) {

        container.innerHTML = `
            <div class="kosong">
                Produk tidak ditemukan.
            </div>
        `;

    }

}


/*
 * ==========================================
 * SEARCH PRODUK KASIR
 * ==========================================
 */

function cariProdukKasir() {

    tampilkanProdukKasir();

}


/*
 * ==========================================
 * TAMBAH KE KERANJANG
 * ==========================================
 */

function tambahKeKeranjang(kodeProduk) {

    const produk =
        daftarProduk.find(
            function(item) {

                return String(item.kode) ===
                    String(kodeProduk);

            }
        );


    if (!produk) {

        alert(
            "Produk tidak ditemukan."
        );


        return;

    }


    if (
        Number(produk.stok) <= 0
    ) {

        alert(
            "Stok produk habis."
        );


        return;

    }


    const produkKeranjang =
        keranjang.find(
            function(item) {

                return String(item.kode) ===
                    String(kodeProduk);

            }
        );


    if (produkKeranjang) {

        if (
            produkKeranjang.jumlah >=
            Number(produk.stok)
        ) {

            alert(
                "Jumlah melebihi stok."
            );


            return;

        }


        produkKeranjang.jumlah++;


        produkKeranjang.subtotal =
            produkKeranjang.jumlah *
            produkKeranjang.hargaJual;

    } else {

        keranjang.push({

            kode:
                produk.kode,

            nama:
                produk.nama,

            hargaBeli:
                Number(
                    produk.hargaBeli
                ) || 0,

            hargaJual:
                Number(
                    produk.hargaJual
                ) || 0,

            jumlah:
                1,

            subtotal:
                Number(
                    produk.hargaJual
                ) || 0

        });

    }


    tampilkanKeranjang();

}


/*
 * ==========================================
 * TOTAL
 * ==========================================
 */

function getTotal() {

    return keranjang.reduce(
        function(total, produk) {

            return total +
                Number(
                    produk.subtotal || 0
                );

        },
        0
    );

}


/*
 * ==========================================
 * KERANJANG
 * ==========================================
 */

function tampilkanKeranjang() {

    const tbody =
        document.getElementById(
            "keranjang"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        keranjang.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="kosong"
                >
                    Keranjang kosong
                </td>
            </tr>
        `;

    } else {

        keranjang.forEach(
            function(produk) {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                produk.nama
                            )}
                        </td>

                        <td>
                            ${produk.jumlah}
                        </td>

                        <td>
                            ${formatRupiah(
                                produk.subtotal
                            )}
                        </td>

                    </tr>

                `;

            }
        );

    }


    const totalElement =
        document.getElementById(
            "total"
        );


    if (totalElement) {

        totalElement.textContent =
            formatRupiah(
                getTotal()
            );

    }

}


/*
 * ==========================================
 * FORM TAMBAH PRODUK
 * ==========================================
 */

function tampilkanFormProduk() {

    const form =
        document.getElementById(
            "formProduk"
        );


    if (form) {

        form.style.display =
            "block";

    }

}


function tutupFormProduk() {

    const form =
        document.getElementById(
            "formProduk"
        );


    if (form) {

        form.style.display =
            "none";

    }

}


/*
 * ==========================================
 * SIMPAN PRODUK
 * ==========================================
 */

function simpanProduk() {

    const kodeElement =
        document.getElementById(
            "kodeProduk"
        );


    const barcodeElement =
        document.getElementById(
            "barcodeProduk"
        );


    const namaElement =
        document.getElementById(
            "namaProdukBaru"
        );


    const kategoriElement =
        document.getElementById(
            "kategoriProduk"
        );


    const hargaBeliElement =
        document.getElementById(
            "hargaBeli"
        );


    const hargaJualElement =
        document.getElementById(
            "hargaJual"
        );


    const stokElement =
        document.getElementById(
            "stokAwal"
        );


    const stokMinimumElement =
        document.getElementById(
            "stokMinimum"
        );


    const satuanElement =
        document.getElementById(
            "satuanProduk"
        );


    const statusElement =
        document.getElementById(
            "statusProduk"
        );


    if (
        !kodeElement ||
        !namaElement
    ) {

        alert(
            "Form produk tidak ditemukan."
        );


        return;

    }


    const kode =
        kodeElement.value.trim();


    const barcode =
        barcodeElement
            ? barcodeElement.value.trim()
            : "";


    const nama =
        namaElement.value.trim();


    const kategori =
        kategoriElement
            ? kategoriElement.value.trim()
            : "";


    const hargaBeli =
        Number(
            hargaBeliElement
                ? hargaBeliElement.value
                : 0
        );


    const hargaJual =
        Number(
            hargaJualElement
                ? hargaJualElement.value
                : 0
        );


    const stok =
        Number(
            stokElement
                ? stokElement.value
                : 0
        );


    const stokMinimum =
        Number(
            stokMinimumElement
                ? stokMinimumElement.value
                : 0
        );


    const satuan =
        satuanElement
            ? satuanElement.value
            : "PCS";


    const status =
        statusElement
            ? statusElement.value
            : "Aktif";


    if (!kode) {

        alert(
            "Kode produk wajib diisi."
        );


        return;

    }


    if (!nama) {

        alert(
            "Nama produk wajib diisi."
        );


        return;

    }


    if (hargaJual <= 0) {

        alert(
            "Harga jual wajib diisi."
        );


        return;

    }


    if (hargaBeli < 0) {

        alert(
            "Harga beli tidak boleh kurang dari 0."
        );


        return;

    }


    if (stok < 0) {

        alert(
            "Stok tidak boleh kurang dari 0."
        );


        return;

    }


    const data = {

        action:
            "produk_tambah",

        kodeProduk:
            kode,

        barcode:
            barcode,

        namaProduk:
            nama,

        kategori:
            kategori,

        hargaBeli:
            hargaBeli,

        hargaJual:
            hargaJual,

        stok:
            stok,

        stokMinimum:
            stokMinimum,

        satuan:
            satuan,

        status:
            status

    };


    kirimKeGoogleSheets(
        data
    );


    alert(
        "Produk berhasil dikirim ke Google Sheets."
    );


    kodeElement.value = "";


    if (barcodeElement) {

        barcodeElement.value = "";

    }


    namaElement.value = "";


    if (kategoriElement) {

        kategoriElement.value = "";

    }


    if (hargaBeliElement) {

        hargaBeliElement.value = "";

    }


    if (hargaJualElement) {

        hargaJualElement.value = "";

    }


    if (stokElement) {

        stokElement.value = "0";

    }


    if (stokMinimumElement) {

        stokMinimumElement.value = "5";

    }


    if (satuanElement) {

        satuanElement.value = "PCS";

    }


    if (statusElement) {

        statusElement.value = "Aktif";

    }


    tutupFormProduk();


    setTimeout(
        ambilProduk,
        1000
    );

}


/*
 * ==========================================
 * PEMBAYARAN
 * ==========================================
 */

function prosesPembayaran() {

    if (
        keranjang.length === 0
    ) {

        alert(
            "Keranjang masih kosong."
        );


        return;

    }


    const metodeElement =
        document.getElementById(
            "metodePembayaran"
        );


    const metode =
        metodeElement
            ? metodeElement.value
            : "cash";


    const total =
        getTotal();


    let uangBayar = 0;


    if (
        metode === "cash"
    ) {

        const uangBayarElement =
            document.getElementById(
                "uangBayar"
            );


        uangBayar =
            Number(
                uangBayarElement
                    ? uangBayarElement.value
                    : 0
            );


        if (
            uangBayar < total
        ) {

            alert(
                "Uang pembayaran kurang."
            );


            return;

        }

    }


    const sekarang =
        new Date();


    const idTransaksi =
        "TRX-" +
        sekarang.getTime();


    const tanggal =
        sekarang.toLocaleDateString(
            "id-ID"
        );


    const jam =
        sekarang.toLocaleTimeString(
            "id-ID"
        );


    /*
     * Simpan setiap produk
     */

    keranjang.forEach(
        function(produk) {

            const data = {

                idTransaksi:
                    idTransaksi,

                tanggal:
                    tanggal,

                jam:
                    jam,

                produk:
                    produk.nama,

                jumlah:
                    produk.jumlah,

                total:
                    produk.subtotal,

                metode:
                    metode.toUpperCase()

            };


            kirimKeGoogleSheets(
                data
            );

        }
    );


    let pesan =
        "PEMBAYARAN BERHASIL!\n\n";


    pesan +=
        "ID Transaksi: " +
        idTransaksi +
        "\n";


    pesan +=
        "Total: " +
        formatRupiah(total);


    if (
        metode === "cash"
    ) {

        pesan +=
            "\nKembalian: " +
            formatRupiah(
                uangBayar - total
            );

    } else {

        pesan +=
            "\nMetode: QRIS";

    }


    alert(pesan);


    keranjang = [];


    const uangBayarElement =
        document.getElementById(
            "uangBayar"
        );


    if (uangBayarElement) {

        uangBayarElement.value = "";

    }


    const kembalianElement =
        document.getElementById(
            "kembalian"
        );


    if (kembalianElement) {

        kembalianElement.textContent =
            "Rp 0";

    }


    tampilkanKeranjang();


    setTimeout(
        ambilProduk,
        1000
    );

}


/*
 * ==========================================
 * KIRIM KE GOOGLE SHEETS
 * ==========================================
 */

function kirimKeGoogleSheets(data) {

    const form =
        document.createElement(
            "form"
        );


    form.method =
        "POST";


    form.target =
        "kirimFrame";


    form.action =
        SCRIPT_URL;


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "hidden";


    input.name =
        "data";


    input.value =
        JSON.stringify(data);


    form.appendChild(
        input
    );


    document.body.appendChild(
        form
    );


    form.submit();


    form.remove();

}


/*
 * ==========================================
 * KEAMANAN
 * ==========================================
 */

function escapeHtml(teks) {

    return String(
        teks || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/*
 * ==========================================
 * IFRAME
 * ==========================================
 */

const iframe =
    document.createElement(
        "iframe"
    );


iframe.name =
    "kirimFrame";


iframe.style.display =
    "none";


document.body.appendChild(
    iframe
);


/*
 * ==========================================
 * JALANKAN SAAT WEBSITE DIBUKA
 * ==========================================
 */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        ambilProduk();

        tampilkanKeranjang();


        const searchProduk =
            document.getElementById(
                "searchProdukKasir"
            );


        if (searchProduk) {

            searchProduk.addEventListener(
                "input",
                cariProdukKasir
            );

        }

    }
);

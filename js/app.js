const { createApp, ref, reactive, watch } = Vue;

createApp({
    setup() {
        // App Core State Reactive Management
        const activeTab = ref('dashboard');
        const isModalOpen = ref(false);
        const modalCategory = ref('');

        // Form Object Bindings (DITAMBAH KEY BARU UNTUK KEBUTUHAN OPTION SELECT)
        const form = reactive({
            m_nama: '', m_stok: '', m_satuan: '',
            p_nama: '', p_peran: '', p_kontak: '', p_kehadiran: 'Hadir',
            s_nama: '', s_volume: '', s_tujuan: '', s_status: 'Diproses',
            t_nama: '', t_tipe: 'Masuk', t_nominal: ''
        });

        // Struktur data default kosong siap pakai
        const defaultStats = {
            material: [],
            pekerja: [],
            pengiriman: [],
            transaksi: []
        };

        // 1. AMBIL DATA DARI MEMORI INTERNAL (Jika ada)
        const savedData = localStorage.getItem('fortis_stats');
        const stats = reactive(savedData ? JSON.parse(savedData) : defaultStats);

        // 2. OTOMATIS SIMPAN DATA SETIAP ADA PERUBAHAN (Tambah / Hapus)
        watch(stats, (newStats) => {
            localStorage.setItem('fortis_stats', JSON.stringify(newStats));
        }, { deep: true });

        // Tailor-made Class Generator for Nav Active States
        const navClass = (tab) => {
            const base = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ";
            if (activeTab.value === tab) {
                return base + "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20";
            }
            return base + "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200";
        };

        const statIcon = (key) => {
            const icons = {
                material: 'fa-solid fa-boxes-stacked',
                pekerja: 'fa-solid fa-users',
                pengiriman: 'fa-solid fa-truck-fast',
                transaksi: 'fa-solid fa-receipt'
            };
            return icons[key] || 'fa-solid fa-folder';
        };

        // Modal Controls
        const openModal = (category) => {
            modalCategory.value = category;
            isModalOpen.value = true;
        };

        const closeModal = () => {
            isModalOpen.value = false;
            // Clear form contents & reset ke nilai default-nya masing-masing
            Object.keys(form).forEach(key => {
                if (key === 't_tipe') form[key] = 'Masuk';
                else if (key === 's_status') form[key] = 'Diproses';
                else if (key === 'p_kehadiran') form[key] = 'Hadir';
                else form[key] = '';
            });
        };

        // Submit Form Handler Interceptor (MENYIMPAN PROPERTI BARU YANG DIINPUT)
        const handleFormSubmit = () => {
            const cat = modalCategory.value;
            const newId = Date.now();

            if (cat === 'material') {
                stats.material.push({ id: newId, nama: form.m_nama, stok: parseInt(form.m_stok), satuan: form.m_satuan });
            } else if (cat === 'pekerja') {
                stats.pekerja.push({ id: newId, nama: form.p_nama, peran: form.p_peran, kontak: form.p_kontak, kehadiran: form.p_kehadiran });
            } else if (cat === 'pengiriman') {
                stats.pengiriman.push({ id: newId, nama: form.s_nama, volume: form.s_volume, tujuan: form.s_tujuan, status: form.s_status });
            } else if (cat === 'transaksi') {
                stats.transaksi.push({ id: newId, nama: form.t_nama, tipe: form.t_tipe, nominal: parseFloat(form.t_nominal) });
            }

            closeModal();
        };

        // Mutation Operations
        const deleteRow = (category, id) => {
            stats[category] = stats[category].filter(item => item.id !== id);
        };

        const resetData = () => {
            if (confirm("Apakah Anda yakin ingin mengosongkan semua data di memori internal?")) {
                stats.material = [];
                stats.pekerja = [];
                stats.pengiriman = [];
                stats.transaksi = [];
            }
        };

        const exportData = () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", `PT_Ananta_Build_Construction_DATA_${Date.now()}.json`);
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        };

        return {
            activeTab, isModalOpen, modalCategory, form, stats,
            navClass, statIcon, openModal, closeModal, handleFormSubmit, deleteRow, resetData, exportData
        }
    }
}).mount('#app');
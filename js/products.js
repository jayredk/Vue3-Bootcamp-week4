import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';
import pagination from './pagination.js';

let productModal = null;
let delProductModal = null;

const app = createApp({
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/',
      apiPath: 'jayredk-hex',
      loading: false,
      product: [],
      tempProduct: {
        imagesUrl:[]
      },
      pagination: {},
      action: ''
    }
  },
  methods: {
    getProduct(page = 1) {
      this.loading = true;
      axios.get(`${this.apiUrl}api/${this.apiPath}/admin/products?page=${page}`)
        .then((res) => {
          this.loading = false;
          if (res.data.success) {
            this.product = res.data.products;
            this.pagination = res.data.pagination;
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    updateProduct(tempProduct) {
      let url = `${this.apiUrl}api/${this.apiPath}/admin/product`;
      let method = 'post';
      let uploadData = {
        data: {...tempProduct}
      };
      this.loading = true;

      if (this.action === 'edit') {
        url = `${this.apiUrl}api/${this.apiPath}/admin/product/${tempProduct.id}`;
        method = 'put';
      }

      axios[method](url, uploadData)
        .then((res) => {
          this.loading = false;
          if (res.data.success) {
            productModal.hide();
            this.getProduct();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => console.log(err));
      
    },
    deleteProduct(tempProduct) {
      this.loading = true;
      axios.delete(`${this.apiUrl}api/${this.apiPath}/admin/product/${tempProduct.id}`)
        .then((res) => {
          this.loading = false;
          if (res.data.success) {
            delProductModal.hide();
            this.getProduct();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    openModal(item) {
      this.action = window.event.target.dataset.action;
      this.$refs.productModal.imgData = null;
      // 待尋 vue solution
      document.getElementById('imageUrl').value = '';
      
      switch (this.action) {
        case 'create':
          this.tempProduct = {imagesUrl:[]};
          productModal.show();
          break;
      
        case 'edit':
          this.tempProduct = {...item};
          if (!this.tempProduct.imagesUrl) {
            this.tempProduct.imagesUrl = [];
          }
          productModal.show();
          break;

        case 'remove':
          this.tempProduct = {...item};
          delProductModal.show();
          break;
      }
    },
    
  },
  components: {
    pagination
  },
  created() {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('hextoken='))
        .split('=')[1];
    if (token !== '') {
      axios.defaults.headers.common['Authorization'] = token;
      this.getProduct();
    } else {
      alert('請重新登入');
      window.location = 'login.html';
    }
  },
  mounted() {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'));
  }
});

app.component('productModal', {
  template: '#productModal',
  props: ['tempProduct', 'action'],
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/',
      apiPath: 'jayredk-hex',
      imgData: null
    }
  },
  methods: {
    getImgData(e) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file-to-upload', file);
      this.imgData = formData;
    },
    uploadImg() {
      axios.post(`${this.apiUrl}api/${this.apiPath}/admin/upload`, this.imgData)
      .then((res) => {
        if (res.data.success) {
          this.imgData = null;
          this.$refs.imageUrl.value = '';
          
          if (this.action === 'create') {
            this.tempProduct.imageUrl = res.data.imageUrl;
          } else if (this.action === 'edit') {
            this.tempProduct.imagesUrl.push(res.data.imageUrl);
          }
        } else {
          alert(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }
});


app.component('delProductModal', {
  template: '#delProductModal',
  props: ['tempProduct']
})

app.mount('#app');
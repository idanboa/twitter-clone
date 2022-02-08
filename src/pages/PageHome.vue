<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute fullscreen">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            v-model="newQweetContent"
            class="new-qweet"
            maxlength="280"
            placeholder="Whats happening?"
            autogrow
            bottom-slots
            counter>
            <template v-slot:before>
              <q-avatar size="xl">
                <img :src="avatar"/>
              </q-avatar>
            </template>
          </q-input>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addNewQweet"
            :disable="!newQweetContent"
            class="q-mb-lg"
            color="primary"
            label="Qweet!" 
            unelevated
            rounded
            no-caps/>
        </div>
      </div>

      <q-separator
        class="divider"
        size="10px"
        color="grey-2" />

      <q-list separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item 
            v-for="qweet in qweets"
            :key="qweet.id"
            class="q-py-md">
            <q-item-section avatar top>
              <q-avatar>
                <img :src="avatar"/>
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                <strong class="q-pr-xs">Idan boadana</strong>
                <span class="text-grey-7">
                  @idanboa 
                  <br class="lt-md">
                  &bull; {{ relativeDate(qweet.date) }}
                  </span>
              </q-item-label>
              <q-item-label class="qweet-content text-body1">
                {{ qweet.content }}
              </q-item-label>
              <div class="qweet-icons row justify-between q-mt-sm">
                <q-btn
                  size="sm"
                  flat
                  round
                  color="grey"
                  icon="far fa-comment" />
                <q-btn
                  size="sm"
                  flat
                  round
                  color="grey"
                  icon="fas fa-retweet" />
                <q-btn
                  size="sm"
                  flat
                  round
                  @click="toggleLiked(qweet)"
                  :color="qweet.liked ? 'pink' : 'grey'"
                  :icon="qweet.liked ? 'fas fa-heart' : 'far fa-heart'" />
                <q-btn
                  @click="removeQweet(qweet)"
                  size="sm"
                  flat
                  round
                  color="grey"
                  icon="fas fa-trash" />
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
// Date helper
import { formatDistance } from 'date-fns';

// Firebase
import db from 'src/boot/firebase'
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  deleteDoc, 
  updateDoc,
  addDoc 
} from "firebase/firestore";

export default defineComponent({
  name: 'PageHome',
  data() {
    return {
      avatar: "https://cdn.quasar.dev/img/avatar" + Math.ceil(Math.random()*6) + ".jpg",

      newQweetContent: '',
      qweets: [
        // {
        //   id: 'id1',
        //   content: '"To be beautiful means to be yourself. You dont need to be accepted by others. You need to accept yourself."',
        //   date: 1643372713813,
        //   liked: false
        // },
        // {
        //   id: 'id2',
        //   content: '"Divide each difficulty into as many parts as is feasible and necessary to resolve it."',
        //   date: 1643372822530,
        //   liked: true
        // }
      ]
    }
  },
  methods: {
    addNewQweet() {
      let newQweet = {
        content: this.newQweetContent,
        date: Date.now(),
        liked: false
      }

      this.updateFirebase(newQweet, 'add')
      this.newQweetContent = '' 
    },

    removeQweet(qweet) {
      this.updateFirebase(qweet, 'remove')
    },

    toggleLiked(qweet) {
      qweet.liked = !qweet.liked
      this.updateFirebase(qweet, 'update')
    },

    relativeDate(value) {
      return formatDistance(value, new Date())
    },

    // Firebase update
    async updateFirebase(qweet, updateType) {
      const collectionName = 'qweets'
      switch (updateType) {
        case 'add':
          console.log('adding')
          await addDoc(collection(db, collectionName), qweet)
          break;
        case 'update':
          await updateDoc(doc(db, collectionName, qweet.id), qweet)
          // const qweetDocument = doc(db, collectionName, qweet.id)
          // await updateDoc(qweetDocument, {
          //   liked: qweet.liked
          // });
          break;
        case 'remove':
          console.log('removing')
          await deleteDoc(doc(db, collectionName, qweet.id))
          break;
        default:
          break;
      }
    }
  },
  mounted() {
    const q = query(collection(db, 'qweets'), orderBy('date', 'asc'))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const qweetUpdate = change.doc.data()
          qweetUpdate.id = change.doc.id
          switch (change.type) {
            case 'added':
              this.qweets.unshift(qweetUpdate)
              break
            case 'modified':
              let modifiedIndex = this.qweets.findIndex(candidate => candidate.id === qweetUpdate.id)
              Object.assign(this.qweets[modifiedIndex], qweetUpdate)
              break 
            case 'removed':
              let removedndex = this.qweets.findIndex(candidate => candidate.id === qweetUpdate.id)
              this.qweets.splice(removedndex, 1)
              break
            default:
          }
        })
      })
  }
})
</script>

<style lang="scss">
  .new-qweet {
    font-size: 19px;
    
    // line-height not working
    .textarea {
      line-height: 1.4 !important; 
    }   
  }

  .divider {
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: $grey-4;
  }

  // pre-line not working
  .qweet-content {
    white-space: pre-line;
  }

  .qweet-icons {
    margin-left: -5px;
  }
</style>
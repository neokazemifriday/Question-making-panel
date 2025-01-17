import Vue from 'vue'
import { Model, Collection } from 'js-abstract-model'
import { ChoiceList } from './Choice'
import { CheckingTimeList } from "@/models/CheckingTime";
import Time from "@/plugins/time";
var md = require('markdown-it')(),
    mk = require('markdown-it-katex')
md.use(mk);

class Question extends Model {
    constructor (data) {
        super(data, [
            {
                key: 'baseRoute',
                default: '/3a/api/exam-question/attach'
            },
            { key: 'id' },
            { key: '_id' },
            { key: 'title' },
            { key: 'statement' },
            { key: 'rendered_statement' },
            { key: 'photo' },
            { key: 'order' },
            { key: 'exams' },
            {
                key: 'isInView',
                default: false
            },
            { key: 'sub_category' },
            { key: 'sub_category_id' },
            {
                key: 'checking_times',
                relatedModel: CheckingTimeList
            },
            {
                key: 'answer'
            },
            {
                key: 'choices',
                relatedModel: ChoiceList
            },
            {
                key: 'state',
                default: ''
            },
            {
                key: 'ltr',
                default: false
            },
            {
                key: 'bookmarked',
                default: false
            },
            { key: 'lesson' },
            {
                key: 'seen',
                default: false
            }
        ])

        if (this.id) {
            this._id = this.id
        }

        if (this._id) {
            this.id = this._id
        }

        let that = this;
        this.apiResource = {
            fields: [
                {key: 'statement'},
                {key: 'sub_category_id'},
                {key: 'exams'},
                {
                    key: 'choices',
                    value: function () {
                        return that.choices.list
                    }
                }
            ]
        }

        if (typeof this.statement === 'string') {
            this.rendered_statement = md.render(this.statement)
        }
    }
    getAnsweredChoice () {
        return this.choices.list.find((item) => {
            return (item.active === true)
        })
    }
    isAnswered () {
        let answeredChoice = this.getAnsweredChoice()

        if (answeredChoice) {
            // this.state = ''
            return true
        } else {
            return false
        }
    }
    changeState (newState) {
        if (newState === 'cross') {
            this.uncheckChoices()
        }
        if (newState === this.state) {
            Vue.set(this, 'state', '')
            return
        }
        Vue.set(this, 'state', newState)
    }
    bookmark () {
        this.bookmarked = !this.bookmarked
    }
    enterQuestion () {
        this.checking_times.addStart()
    }
    leaveQuestion () {
        this.checking_times.addEnd()
    }
    selectChoice (choiceId) {
        const answeredAt = Time.now()
        this.choices.list.map((item)=> {
            Vue.set(item, 'answered_at', answeredAt)
            if (this.state === 'cross') {
                this.state = ''
            }
            if (item.id !== choiceId) {
                Vue.set(item, 'active', false)
                // item.active = false
            } else if (choiceId == null || choiceId == undefined || item.active) {
                Vue.set(item, 'active', false)
                // item.active = false
            } else {
                Vue.set(item, 'active', true)
                // item.active = true
            }
        })
    }

    uncheckChoices () {
        this.choices.list.map((item)=> {
            item.active = false
        })
    }

    onIntersect (entries) {
        this.isInView = entries[0].intersectionRatio >= 0.8
    }
}

class QuestionList extends Collection {
    model () {
        return Question
    }

    changeOrderToInt () {
        this.list.forEach( (item, index, questions) => {
            questions[index].order = parseInt(questions[index].order)
        } )
    }

    sortByOrder() {
        this.changeOrderToInt()
        return this.sortByKey('order');
    }

    getQuestionIndexById (questionId) {
        return this.list.findIndex(
            (item)=>
                questionId !== null && (item.id).toString() === (questionId).toString()
        )
    }

    getQuestionById (questionId) {
        return this.list.find(
            (item)=>
                questionId !== null && (item.id).toString() === (questionId).toString()
        )
    }

    getQuestionByIndex (questionIndex) {
        let question = this.list[questionIndex]
        if (question) {
            return question
        } else {
            return false
        }
    }

    getNextQuestion (questionId) {
        let currentIndex = this.getQuestionIndexById(questionId),
            nextIndex = ++currentIndex
        return this.getQuestionByIndex(nextIndex)
    }

    getPrevQuestion (questionId) {
        let currentIndex = this.getQuestionIndexById(questionId),
            prevIndex = --currentIndex
        return this.getQuestionByIndex(prevIndex)
    }

    turnIsInViewToFalse (startExceptionIndex, endExceptionIndex) {
        this.list.forEach((item, index) => {
            if (index < startExceptionIndex || index > endExceptionIndex) {
                this.list[index].isInView = false
            }
        })
    }
}

export { Question, QuestionList }

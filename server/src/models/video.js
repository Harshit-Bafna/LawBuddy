const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videoUrl: {
            type: String,
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Creator',
            required: true,
        },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            default: null
        },
        dislikes: {
            type: [mongoose.Schema.Types.ObjectId],
            default: null
        }, 
        views: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;

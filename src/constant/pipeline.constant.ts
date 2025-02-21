export const lookupCreatedUpdatedBy = [
  {
    $lookup: {
      from: 'user',
      localField: 'createdBy',
      foreignField: '_id',
      as: 'createUserInfo',
    },
  },
  {
    $lookup: {
      from: 'user',
      localField: 'updatedBy',
      foreignField: '_id',
      as: 'updateUserInfo',
    },
  },
  {
    $unwind: {
      path: '$createUserInfo',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: '$updateUserInfo',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      createdBy: {
        _id: { $toString: '$createUserInfo._id' },
        firstName: { $ifNull: ['$createUserInfo.firstName', null] },
        lastName: { $ifNull: ['$createUserInfo.lastName', null] },
        avatar: { $ifNull: ['$createUserInfo.avatar', null] },
      },
      updatedBy: {
        _id: { $toString: '$updateUserInfo._id' },
        firstName: { $ifNull: ['$updateUserInfo.firstName', null] },
        lastName: { $ifNull: ['$updateUserInfo.lastName', null] },
        avatar: { $ifNull: ['$updateUserInfo.avatar', null] },
      },
    },
  },
  {
    $unset: ['createUserInfo', 'updateUserInfo'],
  },
];

export const convertStartTimeNoTime = {
  $dateFromParts: {
    year: { $year: '$startTime' },
    month: { $month: '$startTime' },
    day: { $dayOfMonth: '$startTime' },
  },
};

export const convertEndTimeNoTime = {
  $dateFromParts: {
    year: { $year: '$endTime' },
    month: { $month: '$endTime' },
    day: { $dayOfMonth: '$endTime' },
  },
};

export const multipleCriteriaSortActiveOrPresent = [
  {
    $addFields: {
      startTimeNoTime: convertStartTimeNoTime,
      endTimeNoTime: convertEndTimeNoTime,
      endTimeNull: {
        $cond: {
          if: { $eq: ['$endTime', null] },
          then: -1,
          else: 1,
        },
      },
    },
  },
  {
    $facet: {
      withNullStartTime: [
        { $match: { startTime: null } },
        { $sort: { lowerTitle: 1 } },
      ],
      withoutNullStartTime: [
        { $match: { startTime: { $ne: null } } },
        {
          $sort: {
            startTimeNoTime: 1,
            endTimeNull: 1,
            endTimeNoTime: 1,
            lowerTitle: 1,
          },
        },
      ],
    },
  },
  {
    $project: {
      result: {
        $concatArrays: ['$withNullStartTime', '$withoutNullStartTime'],
      },
    },
  },
  {
    $unwind: '$result',
  },
  {
    $replaceRoot: {
      newRoot: '$result',
    },
  },
  {
    $unset: ['lowerTitle', 'endTimeNull', 'endTimeNoTime', 'startTimeNoTime'],
  },
];

export const multipleCriteriaSortInactiveOrPast = [
  {
    $addFields: {
      startTimeNoTime: convertStartTimeNoTime,
      endTimeNoTime: convertEndTimeNoTime,
      endTimeNull: {
        $cond: {
          if: { $eq: ['$endTime', null] },
          then: -1,
          else: 1,
        },
      },
    },
  },
  {
    $facet: {
      withNullStartTime: [
        { $match: { startTime: null } },
        { $sort: { lowerTitle: 1 } },
      ],
      withoutNullStartTime: [
        { $match: { startTime: { $ne: null } } },
        {
          $sort: {
            startTimeNoTime: -1,
            endTimeNull: 1,
            endTimeNoTime: -1,
            lowerTitle: 1,
          },
        },
      ],
    },
  },
  {
    $project: {
      result: {
        $concatArrays: ['$withNullStartTime', '$withoutNullStartTime'],
      },
    },
  },
  {
    $unwind: '$result',
  },
  {
    $replaceRoot: {
      newRoot: '$result',
    },
  },
  {
    $unset: ['lowerTitle', 'endTimeNull', 'endTimeNoTime', 'startTimeNoTime'],
  },
];

export const reminderPipeline = [
  {
    $addFields: {
      reminder: {
        $cond: {
          if: {
            $and: [
              { $eq: [{ $ifNull: ['$reminder.startTime', null] }, null] },
              { $eq: [{ $ifNull: ['$reminder.repeat', null] }, null] },
              {
                $eq: [
                  { $ifNull: ['$reminder.isSpecifiedRecipients', null] },
                  null,
                ],
              },
              {
                $eq: [
                  {
                    $size: {
                      $ifNull: ['$reminder.specifiedRecipients', []],
                    },
                  },
                  0,
                ],
              },
            ],
          },
          then: null,
          else: {
            startTime: '$reminder.startTime',
            repeat: '$reminder.repeat',
            isSpecifiedRecipients: '$reminder.isSpecifiedRecipients',
            specifiedRecipients: {
              $map: {
                input: '$reminder.specifiedRecipients',
                as: 'specifiedRecipient',
                in: { $toString: '$$specifiedRecipient' },
              },
            },
          },
        },
      },
    },
  },
];

export const reminderDetailPipeline = {
  isSetReminder: 1,
  reminder: {
    $cond: {
      if: {
        $and: [
          { $eq: [{ $ifNull: ['$reminder.startTime', null] }, null] },
          { $eq: [{ $ifNull: ['$reminder.repeat', null] }, null] },
          {
            $eq: [{ $ifNull: ['$reminder.isSpecifiedRecipients', null] }, null],
          },
          {
            $eq: [
              {
                $size: {
                  $ifNull: ['$reminder.specifiedRecipients', []],
                },
              },
              0,
            ],
          },
        ],
      },
      then: null,
      else: {
        startTime: '$reminder.startTime',
        repeat: '$reminder.repeat',
        isSpecifiedRecipients: '$reminder.isSpecifiedRecipients',
        specifiedRecipients: {
          $map: {
            input: '$reminder.specifiedRecipients',
            as: 'specifiedRecipient',
            in: { $toString: '$$specifiedRecipient' },
          },
        },
      },
    },
  },
};

export const redemptionPipeline = [
  {
    $match: {
      deletedTime: null,
    },
  },
  {
    $lookup: {
      from: 'subscription',
      localField: '_id',
      foreignField: 'promo',
      as: 'subscriptionJoin',
    },
  },
  {
    $lookup: {
      from: 'partner',
      localField: 'partner',
      foreignField: '_id',
      as: 'partnerJoin',
    },
  },
  {
    $unwind: {
      path: '$subscriptionJoin',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: '$partnerJoin',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $match: {
      subscriptionJoin: { $exists: true },
    },
  },
  {
    $project: {
      _id: 1,
      user: '$subscriptionJoin.user',
      code: '$name',
      productId: { $ifNull: ['$subscriptionJoin.productId', null] },
      transactionId: { $ifNull: ['$subscriptionJoin.transactionId', null] },
      transactionDate: {
        $ifNull: ['$subscriptionJoin.transactionDate', null],
      },
      duration: { $ifNull: ['$duration', null] },
      partner: { $ifNull: ['$partnerJoin.name', null] },
    },
  },
  {
    $group: {
      _id: '$transactionId',
      code: { $first: '$code' },
      productId: { $first: '$productId' },
      transactionId: { $first: '$transactionId' },
      transactionDate: { $first: '$transactionDate' },
      duration: { $first: '$duration' },
      partner: { $first: '$partner' },
      user: { $first: '$user' },
    },
  },
  {
    $lookup: {
      from: 'user',
      localField: 'user',
      foreignField: '_id',
      as: 'userJoin',
    },
  },
  {
    $unwind: {
      path: '$userJoin',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      email: '$userJoin.email',
      code: 1,
      productId: 1,
      transactionId: 1,
      transactionDate: 1,
      duration: 1,
      partner: 1,
    },
  },
];

export const queryMedicalRecordPipeline = [
  {
    $lookup: {
      from: 'medical_record',
      localField: 'medRecordId',
      foreignField: '_id',
      as: 'medRecordInfo',
    },
  },
  {
    $lookup: {
      from: 'medical_source',
      localField: 'medRecordInfo.medicalSource',
      foreignField: '_id',
      as: 'medSourceInfo',
    },
  },
  {
    $unwind: {
      path: '$medSourceInfo',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      source: {
        $ifNull: ['$medSourceInfo.name', null],
      },
    },
  },
  {
    $unset: ['medSourceInfo', 'medRecordInfo'],
  },
];

export const medicalRecordDetailPipeline = {
  source: 1,
  originalData: '$rawMedData',
};

export const emergencyAccessExportPipeline = [
  {
    $addFields: {
      lowerTitle: { $toLower: { $ifNull: ['$title', null] } },
    },
  },
  ...multipleCriteriaSortActiveOrPresent,
  {
    $project: {
      _id: { $toString: '$_id' },
      title: { $ifNull: ['$title', null] },
      startTime: { $ifNull: ['$startTime', null] },
      endTime: { $ifNull: ['$endTime', null] },
      updatedTime: { $ifNull: ['$updatedTime', null] },
      location: { $ifNull: ['$location', null] },
      conditionSeverity: { $ifNull: ['$conditionSeverity', null] },
      allergySeverity: { $ifNull: ['$allergySeverity', null] },
      type: { $ifNull: ['$type', null] },
      takeAsNeeded: { $ifNull: ['$takeAsNeeded', null] },
      prescription: { $ifNull: ['$prescription.prescription', null] },
      specialty: { $ifNull: ['$specialty', null] },
      phone: { $ifNull: ['$phone', null] },
      status: { $ifNull: ['$status', null] },
      cardType: 1,
      isFollowedUp: 1,
    },
  },
];

export const addFieldsPremiumOwnerProfilePipeline = [
  {
    $addFields: {
      premiumExpiresTime: {
        $cond: {
          if: {
            $and: [
              { $ne: ['$userJoin.subscription', null] },
              { $ne: ['$userJoin.subscription.expiresDate', null] },
              {
                $ne: [
                  { $type: '$userJoin.subscription.expiresDate' },
                  'string',
                ],
              },
              { $gt: ['$userJoin.subscription.expiresDate', new Date()] },
            ],
          },
          then: '$userJoin.subscription.expiresDate',
          else: null,
        },
      },
      isPremium: {
        $cond: {
          if: {
            $and: [
              { $ne: ['$userJoin.subscription', null] },
              { $ne: ['$userJoin.subscription.expiresDate', null] },
              {
                $ne: [
                  { $type: '$userJoin.subscription.expiresDate' },
                  'string',
                ],
              },
              { $gt: ['$userJoin.subscription.expiresDate', new Date()] },
            ],
          },
          then: true,
          else: false,
        },
      },
    },
  },
];
